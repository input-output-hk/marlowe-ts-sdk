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
  addressBech32,
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
  getApplicableActions,
  mkApplicableActionsFilter,
  mkPartyFilter,
} from "./applicable-inputs.js";
import arg from "arg";

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

  const [contractId, txId] = await createContract(lifecycle, {
    payFrom: { address: walletAddress },
    payTo: { address: payee },
    amount,
    depositDeadline,
    releaseDeadline,
  });

  console.log(`Contract created with id ${contractId}`);
  await waitIndicator(lifecycle.wallet, txId);

  // await contractMenu(lifecycle, contractId);
}

async function loadContractMenu(lifecycle: RuntimeLifecycle) {
  const cid = await input({
    message: "Enter the contractId",
  });
  await contractMenu(lifecycle, contractId(cid));
}

async function debugGetNext(
  lifecycle: RuntimeLifecycle,
  contractDetails: ContractDetails,
  contractId: ContractId
) {
  const now = datetoTimeout(new Date());

  if (contractDetails.currentContract._tag === "None") {
    console.log("DEBUG: current contract none");
  }

  const currentContract =
    contractDetails.currentContract._tag === "None"
      ? contractDetails.initialContract
      : contractDetails.currentContract.value;
  const oneDayFrom = (time: Timeout) => time + 24n * 60n * 60n * 1000n; // in milliseconds
  const nextTimeout = getNextTimeout(currentContract, now) ?? oneDayFrom(now);
  const timeInterval = { from: now, to: nextTimeout - 1n };
  console.log("time interval", timeInterval);
  const applicableInputs = await lifecycle.contracts.getApplicableInputs(
    contractId,
    { timeInterval }
  );
  console.log("applicable inputs");
  console.log(MarloweJSON.stringify(applicableInputs, null, 2));
}

function debugApplicableActions(applicableActions: ApplicableAction[]) {
  applicableActions.forEach((action) => {
    console.log("***");
    console.log(MarloweJSON.stringify(action, null, 2));
    let result;
    if (action.type === "Choice") {
      console.log(
        "automatically choosing",
        action.choice.choose_between[0].from
      );
      result = action.applyAction(action.choice.choose_between[0].from);
    } else {
      result = action.applyAction();
    }
    console.log("expected results", MarloweJSON.stringify(result, null, 2));
  });
}
async function contractMenu(
  lifecycle: RuntimeLifecycle,
  contractId: ContractId
) {
  console.log("TODO: print contract state");
  const contractDetails = await lifecycle.restClient.getContractById(
    contractId
  );

  // await debugGetNext(lifecycle, contractDetails, contractId);

  const applicableActions = await getApplicableActions(
    lifecycle.restClient,
    contractId
  );
  const myActionsFilter = await mkApplicableActionsFilter(lifecycle.wallet);
  const choices = applicableActions.filter(myActionsFilter)
  debugApplicableActions(choices);


  const answer = await select({
    message: "Contract menu",
    choices: [
      { name: "Re-check contract state", value: "check-state" },
      { name: "Deposit", value: "deposit" },
      { name: "Release funds", value: "release" },
      { name: "Return to main menu", value: "return" },
    ],
  });
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

// #region Marlowe specifics
interface DelayPaymentSchema {
  payFrom: Address;
  payTo: Address;
  amount: bigint;
  depositDeadline: Date;
  releaseDeadline: Date;
}
// TODO: move to marlowe-object
type ContractBundle = {
  main: Label;
  bundle: Bundle;
};

const splitAddress = ({ address }: Address) => {
  const halfLength = Math.floor(address.length / 2);
  const s1 = address.substring(0, halfLength);
  const s2 = address.substring(halfLength);
  return [s1, s2];
};

const mkDelayPaymentTags = (schema: DelayPaymentSchema) => {
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
async function createContract(
  lifecycle: RuntimeLifecycle,
  schema: DelayPaymentSchema
): Promise<[ContractId, TxId]> {
  const contractBundle = mkDelayPayment(schema);
  const tags = mkDelayPaymentTags(schema);
  // TODO: create a new function in lifecycle `createContractFromBundle`
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

function mkDelayPayment(schema: DelayPaymentSchema): ContractBundle {
  return {
    main: "initial-deposit",
    bundle: [
      {
        label: "release-funds",
        type: "contract",
        value: {
          when: [],
          timeout: datetoTimeout(schema.releaseDeadline),
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
                party: schema.payFrom,
                deposits: schema.amount,
                of_token: lovelace,
                into_account: schema.payTo,
              },
              then: {
                ref: "release-funds",
              },
            },
          ],
          timeout: datetoTimeout(schema.depositDeadline),
          timeout_continuation: "close",
        },
      },
    ],
  };
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
// #endregion
