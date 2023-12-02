import * as t from "io-ts/lib/index.js";
import * as G from "@marlowe.io/language-core-v1/guards";
import * as fs from "fs/promises";
import { mkLucidWallet } from "@marlowe.io/wallet";
import { Lucid, Blockfrost } from "lucid-cardano";

const lucidNetworkGuard = t.union([
  t.literal("Mainnet"),
  t.literal("Preview"),
  t.literal("Preprod"),
  t.literal("Custom"),
]);

const configGuard = t.type({
  blockfrostProjectId: t.string,
  blockfrostUrl: t.string,
  network: lucidNetworkGuard,
  seedPhrase: t.string,
});

type Config = t.TypeOf<typeof configGuard>;

async function readConfig(): Promise<Config> {
  const configStr = await fs.readFile("./.config.json", { encoding: "utf-8" });
  console.log(JSON.parse(configStr));
  const result = configGuard.decode(JSON.parse(configStr));
  if (result._tag === "Left") {
    throw new Error("Invalid config.json");
  }
  return result.right;
}

const log = console.log.bind(console);

async function main() {
  const config = await readConfig();
  const lucid = await Lucid.new(
    new Blockfrost(config.blockfrostUrl, config.blockfrostProjectId),
    config.network
  );
  lucid.selectWalletFromSeed(config.seedPhrase);

  const wallet = mkLucidWallet(lucid);

  const isMainnet = await wallet.isMainnet();
  log(` * Network from API:  ${isMainnet ? "Mainnet" : "Testnet"}`);
  log(` * Network from lucid: ${lucid.network}`);
  const lovelaces = await wallet.getLovelaces();
  log(` * Lovelaces: ${lovelaces}`);
  log("");
  const tokensResult = await wallet.getTokens();
  log(`* Tokens: (${tokensResult.length} tokens)`);
  tokensResult.map((token) => {
    const tokenName =
      token.assetId.assetName == "" ? "lovelaces" : token.assetId.assetName;
    log(`   ${tokenName} - ${token.quantity}`);
  });
  log("");
  const changeAddress = await wallet.getChangeAddress();
  log("* Change Address: " + changeAddress);
  log("");

  const usedAddresses = await wallet.getUsedAddresses();
  log(`* Used Addresses: (${usedAddresses.length} addresses)`);
  usedAddresses.map((usedAddress) =>
    log("    - " + usedAddress)
  );
  log("");

  const collaterals = await wallet.getCollaterals();
  log(`* Collaterals: (${collaterals.length} collaterals)`);
  collaterals.map((collateral) => log("    - " + collateral));
  log("");

  const utxos = await wallet.getUTxOs();
  log(`* UTxOs: (${utxos.length} utxos)`);
  utxos.map((utxo) => log("    - " + utxo));
  log("");
  log("Wallet flow done 🎉");
  // const wallet = await mkLucidWallet(lucid, config.seedPhrase);
  // console.log(wallet);
  // console.log(G.Contract);
  // console.log(mkLucidWallet);
}

await main();
