/**
 * This example shows how to work with the marlowe-object package, which is needed when we
 * want to create large contracts through the use of Merkleization.
 *
 * The script is a command line tool that makes a delay payment to a given address.
 */
import { mkLucidWallet, WalletAPI } from "@marlowe.io/wallet";
import { mkRuntimeLifecycle } from "@marlowe.io/runtime-lifecycle";
import { Lucid, Blockfrost, C } from "lucid-cardano";
import { readConfig } from "./config.js";
import {
  datetoTimeout,
  getNextTimeout,
  Timeout,
} from "@marlowe.io/language-core-v1";
import {
  contractId,
  ContractId,
  contractIdToTxId,
  Tags,
  transactionWitnessSetTextEnvelope,
  TxId,
} from "@marlowe.io/runtime-core";
import { Address } from "@marlowe.io/language-core-v1";
import { Bundle, Label, lovelace } from "@marlowe.io/marlowe-object";
import { input, select } from "@inquirer/prompts";
import { RuntimeLifecycle } from "@marlowe.io/runtime-lifecycle/api";
import { MarloweJSON } from "@marlowe.io/adapter/codec";
import { ContractDetails } from "@marlowe.io/runtime-rest-client/contract";
import {
  ApplicableAction,
  AppliedActionResult,
  getApplicableActions,
  mkApplicableActionsFilter,
} from "./experimental-features/applicable-inputs.js";
import arg from "arg";
import { POSIXTime, posixTimeToIso8601 } from "@marlowe.io/adapter/time";
import { splitAddress } from "./experimental-features/metadata.js";
import { SingleInputTx } from "../../../packages/language/core/v1/dist/esm/transaction.js";
import * as t from "io-ts/lib/index.js"
import { deepEqual } from "@marlowe.io/adapter/deep-equal";
const args = arg({
  "--help": Boolean,
  "--config": String,
  "-c": "--config",
});

if (args["--help"]) {
  printHelp(0);
}
main();

// #region Interactive menu
function printHelp(exitStatus: number): never {
  console.log(
    "Usage: npm run marlowe-object-flow -- --config <config-file>"
  );
  console.log("");
  console.log("Example:");
  console.log(
    "  npm run marlowe-object-flow -- --config alice.config"
  );
  console.log("Options:");
  console.log("  --help: Print this message");
  console.log("  --config | -c: The path to the config file [default .config.json]");
  process.exit(exitStatus);
}


async function waitIndicator(wallet: WalletAPI, txId: TxId) {
  process.stdout.write("Waiting for the transaction to be confirmed...");
  let done = false;
  function writeDot(): Promise<void> {
    process.stdout.write(".");
    return new Promise((resolve) => setTimeout(resolve, 1000)).then(() => {
      if (!done) {
        return writeDot();
      }
    });
  }

  await Promise.all([
    wallet.waitConfirmation(txId).then(() => (done = true)),
    writeDot(),
  ]);
  process.stdout.write("\n");
}

function bech32Validator(value: string) {
  try {
    C.Address.from_bech32(value);
    return true;
  } catch (e) {
    return "Invalid address";
  }
}
function positiveBigIntValidator(value: string) {
  try {
    if (BigInt(value) > 0) {
      return true;
    } else {
      return "The amount must be greater than 0";
    }
  } catch (e) {
    return "The amount must be a number";
  }
}

function dateInFutureValidator(value: string) {
  const d = new Date(value);
  if (isNaN(d.getTime())) {
    return "Invalid date";
  }
  if (d <= new Date()) {
    return "The date must be in the future";
  }
  return true;
}

async function createContractMenu(lifecycle: RuntimeLifecycle) {
  const payee = await input({
    message: "Enter the payee address",
    validate: bech32Validator,
  });
  const amountStr = await input({
    message: "Enter the payment amount in lovelaces",
    validate: positiveBigIntValidator,
  });

  const amount = BigInt(amountStr);

  const depositDeadlineStr = await input({
    message: "Enter the deposit deadline",
    validate: dateInFutureValidator,
  });
  const depositDeadline = new Date(depositDeadlineStr);

  const releaseDeadlineStr = await input({
    message: "Enter the release deadline",
    validate: dateInFutureValidator,
  });
  const releaseDeadline = new Date(releaseDeadlineStr);

  const walletAddress = await lifecycle.wallet.getChangeAddress();
  console.log(
    `Making a delayed payment from  ${walletAddress} to ${payee} for ${amount} lovelaces`
  );
  console.log(
    `The payment must be deposited by ${depositDeadline} and will be released to ${payee} by ${releaseDeadline}`
  );

  const scheme = {
    payFrom: { address: walletAddress },
    payTo: { address: payee },
    amount,
    depositDeadline,
    releaseDeadline,
  };
  const [contractId, txId] = await createContract(lifecycle, scheme);

  console.log(`Contract created with id ${contractId}`);

  await waitIndicator(lifecycle.wallet, txId);

  await contractMenu(lifecycle, scheme, contractId);
}

async function loadContractMenu(lifecycle: RuntimeLifecycle) {
  const cidStr = await input({
    message: "Enter the contractId",
  });
  const cid = contractId(cidStr);

  const contractDetails = await lifecycle.restClient.getContractById(
    cid
  );

  const scheme = extractSchemeFromTags(contractDetails.tags);
  console.log("Contract details:");
  console.log(`  * Pay from: ${scheme.payFrom.address}`);
  console.log(`  * Pay to: ${scheme.payTo.address}`);
  console.log(`  * Amount: ${scheme.amount} lovelaces`);
  console.log(`  * Deposit deadline: ${scheme.depositDeadline}`);
  console.log(`  * Release deadline: ${scheme.releaseDeadline}`);

  const contractBundle = mkDelayPayment(scheme);
  const {contractSourceId} = await lifecycle.restClient.createContractSources(
    contractBundle.main,
    contractBundle.bundle
  );
  const initialContract = await lifecycle.restClient.getContractSourceById({ contractSourceId} );

  if (!deepEqual(initialContract, contractDetails.initialContract)) {
    throw new Error("The contract on chain does not match the expected contract for the scheme");
  };

  return contractMenu(lifecycle, scheme, cid);
}

async function contractMenu(
  lifecycle: RuntimeLifecycle,
  scheme: DelayPaymentScheme,
  contractId: ContractId
): Promise<void> {
  const inputHistory = await lifecycle.contracts.getInputHistory(contractId);

  const contractState = getState(scheme, new Date(), inputHistory);
  printState(contractState, scheme);
  if (contractState.type === "Closed") return;

  const applicableActions = await getApplicableActions(
    lifecycle.restClient,
    contractId
  );

  const myActionsFilter = await mkApplicableActionsFilter(lifecycle.wallet);
  const myActions = applicableActions.filter(myActionsFilter)

  const choices: Array<{name: string, value: {actionType: string, results?: AppliedActionResult}}>  = [
    { name: "Re-check contract state", value: {actionType: "check-state", results: undefined} },
    ...myActions.map(action => {
      switch (action.type) {
        case "Advance":

          return {
            name: "Close contract",
            description: contractState.type == "PaymentMissed" ? "The payer will receive minUTXO" : "The payer will receive minUTXO and the payee will receive the payment",
            value: {actionType: "advance", results: action.applyAction() }
            }

        case "Deposit":
          return { name: `Deposit ${action.deposit.deposits} lovelaces`, value: {actionType: "deposit", results: action.applyAction()} }
        default:
          throw new Error("Unexpected action type")
      }
    }),
    { name: "Return to main menu", value: {actionType: "return", results: undefined} },
  ]

  const action = await select({
    message: "Contract menu",
    choices,
  });
  let txId
  switch (action.actionType) {
    case "check-state":
      return contractMenu(lifecycle, scheme, contractId)
    case "advance":
      if (!action.results) throw new Error("This should not happen")
      console.log("Advancing contract");
      txId = await lifecycle.contracts.applyInputs(contractId, {inputs: action.results.inputs})
      console.log(`Input applied with txId ${txId}`)
      await waitIndicator(lifecycle.wallet, txId);
      return contractMenu(lifecycle, scheme, contractId)
    case "deposit":
      // TODO: Remove duplication
      if (!action.results) throw new Error("This should not happen")
      console.log("Making deposit");
      txId = await lifecycle.contracts.applyInputs(contractId, {inputs: action.results.inputs})
      console.log(`Input applied with txId ${txId}`)
      await waitIndicator(lifecycle.wallet, txId);
      return contractMenu(lifecycle, scheme, contractId)
    case "return":
      return;
  }
}

async function mainLoop(lifecycle: RuntimeLifecycle) {
  try {
    while (true) {
      const action = await select({
        message: "Main menu",
        choices: [
          { name: "Create a contract", value: "create" },
          { name: "Load contract", value: "load" },
          { name: "Exit", value: "exit" },
        ],
      });
      switch (action) {
        case "create":
          await createContractMenu(lifecycle);
          break;
        case "load":
          await loadContractMenu(lifecycle);
          break;
        case "exit":
          process.exit(0);
      }
    }
  } catch (e) {
    if (e instanceof Error && e.message.includes("closed the prompt")) {
      process.exit(0);
    } else {
      throw e;
    }
  }
}
// #endregion

// #region Delay Payment Contract
/**
 * These are the parameters of the contract
 */
interface DelayPaymentScheme {
  /**
   * Who is making the delayed payment
   */
  payFrom: Address;
  /**
   * Who is receiving the payment
   */
  payTo: Address;
  /**
   * The amount of lovelaces to be paid
   */
  amount: bigint;
  /**
   * The deadline for the payment to be made. If the payment is not made by this date, the contract can be closed
   */
  depositDeadline: Date;
  /**
   * A date after the payment can be released to the receiver.
   * NOTE: An empty transaction must be done to close the contract
   */
  releaseDeadline: Date;
}

function mkDelayPayment(scheme: DelayPaymentScheme): ContractBundle {
  return {
    main: "initial-deposit",
    bundle: [
      {
        label: "release-funds",
        type: "contract",
        value: {
          when: [],
          timeout: datetoTimeout(scheme.releaseDeadline),
          timeout_continuation: "close",
        },
      },
      {
        label: "initial-deposit",
        type: "contract",
        value: {
          when: [
            {
              case: {
                party: scheme.payFrom,
                deposits: scheme.amount,
                of_token: lovelace,
                into_account: scheme.payTo,
              },
              then: {
                ref: "release-funds",
              },
            },
          ],
          timeout: datetoTimeout(scheme.depositDeadline),
          timeout_continuation: "close",
        },
      },
    ],
  };
}
// #endregion

// #region Delay Payment State
/**
 * The delay payment contract can be in one of the following logical states:
 */
type DelayPaymentState =
  | InitialState
  | PaymentDeposited
  | PaymentMissed
  | PaymentReady
  | Closed;
/**
 * In the initial state the contract is waiting for the payment to be deposited
 */
type InitialState = {
  type: "InitialState";
}

/**
 * After the payment is deposited, the contract is waiting for the payment to be released
 */
type PaymentDeposited = {
  type: "PaymentDeposited";
}

/**
 * If the payment is not deposited by the deadline, the contract can be closed.
 * NOTE: It is not necesary to close the contract, as it will consume transaction fee (but it will release
 *       the minUTXO)
 */
type PaymentMissed = {
  type: "PaymentMissed";
}

/**
 * After the release deadline, the payment is still in the contract, and it is ready to be released.
 */
type PaymentReady = {
  type: "PaymentReady";
}

type Closed = {
  type: "Closed";
  result: "Missed deposit" | "Payment released";
}

function printState(state: DelayPaymentState, scheme: DelayPaymentScheme) {
  switch (state.type) {
    case "InitialState":
      console.log(`Waiting ${scheme.payFrom.address} to deposit ${scheme.amount}`);
      break;
    case "PaymentDeposited":
      console.log(`Payment deposited, waiting until ${scheme.releaseDeadline} to be able to release the payment`);
      break;
    case "PaymentMissed":
      console.log(`Payment missed on ${scheme.depositDeadline}, contract can be closed to retrieve minUTXO`);
      break;
    case "PaymentReady":
      console.log(`Payment ready to be released`);
      break;
    case "Closed":
      console.log(`Contract closed: ${state.result}`);
      break;
  }
}

function getState(scheme: DelayPaymentScheme, currentTime: Date, history: SingleInputTx[]): DelayPaymentState {
  if (history.length === 0) {
    if (currentTime < scheme.depositDeadline) {
      return { type: "InitialState" };
    } else {
      return { type: "PaymentMissed" };
    }
  } else if (history.length === 1) {
    // If the first transaction doesn't have an input, it means it was used to advace a timeouted contract
    if (!history[0].input) {
      return { type: "Closed", result: "Missed deposit" };
    }
    if (currentTime < scheme.releaseDeadline) {
      return { type: "PaymentDeposited" };
    } else {
      return { type: "PaymentReady" };
    }
  } else if (history.length === 2) {
    return { type: "Closed", result: "Payment released" };
  } else {
    throw new Error("Wrong state/contract, too many transactions");
  }
}

// #endregion

// TODO: move to marlowe-object
type ContractBundle = {
  main: Label;
  bundle: Bundle;
};

const mkDelayPaymentTags = (schema: DelayPaymentScheme) => {
  const tag = "DELAY_PYMNT-1";
  const tags = {} as Tags;

  tags[`${tag}-from-0`] = splitAddress(schema.payFrom)[0];
  tags[`${tag}-from-1`] = splitAddress(schema.payFrom)[1];
  tags[`${tag}-to-0`] = splitAddress(schema.payTo)[0];
  tags[`${tag}-to-1`] = splitAddress(schema.payTo)[1];
  tags[`${tag}-amount`] = schema.amount;
  tags[`${tag}-deposit`] = schema.depositDeadline;
  tags[`${tag}-release`] = schema.releaseDeadline;
  return tags;
};

const extractSchemeFromTags = (tags: unknown): DelayPaymentScheme => {
  const tagsGuard = t.type({
    "DELAY_PYMNT-1-from-0": t.string,
    "DELAY_PYMNT-1-from-1": t.string,
    "DELAY_PYMNT-1-to-0": t.string,
    "DELAY_PYMNT-1-to-1": t.string,
    "DELAY_PYMNT-1-amount": t.bigint,
    "DELAY_PYMNT-1-deposit": t.string,
    "DELAY_PYMNT-1-release": t.string,
  });

  if (!tagsGuard.is(tags)) {
    throw new Error("The contract does not have the expected tags");
  }

  return {
    payFrom: { address: `${tags["DELAY_PYMNT-1-from-0"]}${tags["DELAY_PYMNT-1-from-1"]}` },
    payTo: { address: `${tags["DELAY_PYMNT-1-to-0"]}${tags["DELAY_PYMNT-1-to-1"]}` },
    amount: tags["DELAY_PYMNT-1-amount"],
    depositDeadline: new Date(tags["DELAY_PYMNT-1-deposit"]),
    releaseDeadline: new Date(tags["DELAY_PYMNT-1-release"]),
  };
}

async function createContract(
  lifecycle: RuntimeLifecycle,
  schema: DelayPaymentScheme
): Promise<[ContractId, TxId]> {
  const contractBundle = mkDelayPayment(schema);
  const tags = mkDelayPaymentTags(schema);
  // TODO: PLT-9089: Modify runtimeLifecycle.contracts.createContract to support bundle (calling createContractSources)
  const contractSources = await lifecycle.restClient.createContractSources(
    contractBundle.main,
    contractBundle.bundle
  );
  const walletAddress = await lifecycle.wallet.getChangeAddress();
  const unsignedTx = await lifecycle.restClient.buildCreateContractTx({
    sourceId: contractSources.contractSourceId,
    tags,
    changeAddress: walletAddress,
    minimumLovelaceUTxODeposit: 3_000_000,
    version: "v1",
  });
  const signedCborHex = await lifecycle.wallet.signTx(unsignedTx.tx.cborHex);
  await lifecycle.restClient.submitContract(
    unsignedTx.contractId,
    transactionWitnessSetTextEnvelope(signedCborHex)
  );
  const txId = contractIdToTxId(unsignedTx.contractId);
  return [unsignedTx.contractId, txId];
  //----------------
}

async function main() {
  const config = await readConfig(args["--config"]);
  const lucid = await Lucid.new(
    new Blockfrost(config.blockfrostUrl, config.blockfrostProjectId),
    config.network
  );
  lucid.selectWalletFromSeed(config.seedPhrase);

  const runtimeURL = config.runtimeURL;

  const wallet = mkLucidWallet(lucid);

  const lifecycle = mkRuntimeLifecycle({
    runtimeURL,
    wallet,
  });
  await mainLoop(lifecycle);
}

