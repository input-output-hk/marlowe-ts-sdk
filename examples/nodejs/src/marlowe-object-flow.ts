/**
 * This example shows how to work with the marlowe-object package, which is needed when we
 * want to create large contracts through the use of Merkleization.
 *
 * The script is a command line tool that makes a delay payment to a given address.
 */
import arg from "arg";

import { mkLucidWallet } from "@marlowe.io/wallet";
import { mkRuntimeLifecycle } from "@marlowe.io/runtime-lifecycle";
import { Lucid, Blockfrost, C } from "lucid-cardano";
import { readConfig } from "./config.js";
import { datetoTimeout } from "@marlowe.io/language-core-v1";
import { addressBech32, ContractId } from "@marlowe.io/runtime-core";
import { Address } from "@marlowe.io/language-core-v1";
import { Bundle, Label, lovelace } from "@marlowe.io/marlowe-object";
import { input, select } from "@inquirer/prompts";
main();

function bech32Validator(value: string) {
  try {
    C.Address.from_bech32(value);
    return true;
  } catch (e) {
    return "Invalid address";
  }
}
function positiveBigIntValidator (value: string) {
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

function dateInFutureValidator (value: string) {
  const d = new Date(value);
  if (isNaN(d.getTime())) {
    return "Invalid date";
  }
  if (d <= new Date()) {
    return "The date must be in the future";
  }
  return true;
}

async function createContractMenu() {
  const payee = await input({
    message: "Enter the payee address",
    validate: bech32Validator,
  });
  console.log(payee);
  const amountStr = await input({
    message: "Enter the payment amount in lovelaces",
    validate: positiveBigIntValidator,
  });

  const amount = BigInt(amountStr);
  console.log(amount);

  const depositDeadlineStr = await input({
    message: "Enter the deposit deadline",
    validate: dateInFutureValidator,
  });
  const depositDeadline = new Date(depositDeadlineStr);
  console.log(depositDeadline);

  const releaseDeadlineStr = await input({
    message: "Enter the release deadline",
    validate: dateInFutureValidator,
  });
  const releaseDeadline = new Date(releaseDeadlineStr);
  console.log(releaseDeadline);
  await contractMenu();
}

async function loadContractMenu() {
  const answer = await input({
    message: "Enter the contractId",
  });
  console.log(answer);
  await contractMenu();
}

// async function contractMenu(contractId: ContractId) {
async function contractMenu() {
  console.log("TODO: print contract state");
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

async function mainLoop() {
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
          await createContractMenu();
          break;
        case "load":
          await loadContractMenu();
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

type CliArgs = ReturnType<typeof parseCliArgs>;

function parseCliArgs() {
  const args = arg({
    "--help": Boolean,
    "--pay-to": String,
    "--amount": Number,
    "--deposit-deadline": String,
    "--release-deadline": String,
    "-a": "--amount",
  });

  function printHelp(exitStatus: number): never {
    console.log(
      "Usage: npm run marlowe-object-flow -- <pay-to> <amount> <deadlines>"
    );
    console.log("");
    console.log("Example:");
    console.log(
      "  npm run marlowe-object-flow -- --pay-to addr1_af33.... -a 10000000 --deposit-deadline 2024-01-01 --release-deadline 2024-01-02"
    );
    console.log("Options:");
    console.log("  --help: Print this message");
    console.log("  --pay-to: The address of the payee");
    console.log("  --amount: The amount of lovelace to pay");
    console.log("  --deposit-deadline: When the payment must be deposited");
    console.log(
      "  --release-deadline: When the payment is released from the contract to the payee"
    );
    console.log("");
    console.log(
      "All dates must be in a format that is parsable by the Date constructor"
    );
    console.log("");
    process.exit(exitStatus);
  }

  function badCliOptions(message: string) {
    console.error("********** ERROR **********");
    console.error(message);
    console.error("");
    console.error("");
    console.error("");
    return printHelp(1);
  }

  if (args["--help"]) {
    printHelp(0);
  }

  const payTo =
    args["--pay-to"] ??
    badCliOptions("You must specify the address of the payee");
  const amount =
    args["--amount"] ??
    badCliOptions("You must specify the amount of lovelace to pay");
  const depositDeadlineStr =
    args["--deposit-deadline"] ??
    badCliOptions("You must specify the deposit deadline");
  const releaseDeadlineStr =
    args["--release-deadline"] ??
    badCliOptions("You must specify the release deadline");

  const depositDeadline = new Date(depositDeadlineStr);
  const releaseDeadline = new Date(releaseDeadlineStr);

  // Check if depositDeadline and releaseDeadline are valid dates and both are in the future
  if (
    isNaN(depositDeadline.getTime()) ||
    isNaN(releaseDeadline.getTime()) ||
    depositDeadline <= new Date() ||
    releaseDeadline <= new Date()
  ) {
    badCliOptions(
      "Invalid deposit deadline or release deadline. Both must be valid dates in the future."
    );
  }
  return {
    payTo,
    amount,
    depositDeadline,
    releaseDeadline,
  };
}

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
  // const args = parseCliArgs();
  const config = await readConfig();
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
  const walletAddress = await wallet.getChangeAddress();
  await mainLoop();
  // console.log(
  //   `Making a delayed payment from  ${walletAddress} to ${args.payTo} for ${args.amount} lovelaces`
  // );
  // console.log(
  //   `The payment must be deposited by ${args.depositDeadline} and will be released to ${args.payTo} by ${args.releaseDeadline}`
  // );
}
