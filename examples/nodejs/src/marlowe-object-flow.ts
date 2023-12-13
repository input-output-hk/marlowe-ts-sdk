/**
 * This example shows how to work with the marlowe-object package, which is needed when we
 * want to create large contracts through the use of Merkleization.
 *
 * The script is a command line tool that makes a delay payment to a given address.
 */
import arg from "arg";

import { mkLucidWallet } from "@marlowe.io/wallet";
import { mkRuntimeLifecycle } from "@marlowe.io/runtime-lifecycle";
import { Lucid, Blockfrost } from "lucid-cardano";
import { readConfig } from "./config.js";
import { datetoTimeout } from "@marlowe.io/language-core-v1";
import { addressBech32 } from "@marlowe.io/runtime-core";

main();
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

async function main() {
  const args = parseCliArgs();
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

  console.log(`Making a delayed payment from  ${walletAddress} to ${args.payTo} for ${args.amount} lovelaces`);
  console.log(`The payment must be deposited by ${args.depositDeadline} and will be released to ${args.payTo} by ${args.releaseDeadline}`);
}
