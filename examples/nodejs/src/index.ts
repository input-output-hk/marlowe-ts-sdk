import * as t from "io-ts/lib/index.js";
import * as G from "@marlowe.io/language-core-v1/guards";
import * as fs from "fs/promises";
import { mkLucidWallet } from "@marlowe.io/wallet";
import {Lucid, Blockfrost} from "lucid-cardano";



const lucidNetworkGuard = t.union([
  t.literal("Mainnet"),
  t.literal("Preview"),
  t.literal("Preprod"),
  t.literal("Custom")
]);

const configGuard = t.type({
  blockfrostProjectId: t.string,
  blockfrostUrl: t.string,
  network: lucidNetworkGuard,
  seedPhrase: t.string,
});

type Config = t.TypeOf<typeof configGuard>;

async function readConfig(): Promise<Config> {
  const configStr = await fs.readFile("./.config.json", {encoding: "utf-8"});
  console.log(JSON.parse(configStr))
  const result = configGuard.decode(JSON.parse(configStr));
  if (result._tag === "Left") {
    throw new Error("Invalid config.json");
  }
  return result.right;
}


async function main() {
  const config = await readConfig();
  const lucid = await Lucid.new(
    new Blockfrost(config.blockfrostUrl, config.blockfrostProjectId),
    config.network,
  );
  lucid.selectWalletFromSeed(config.seedPhrase);
  console.log(lucid);
  const w = mkLucidWallet(lucid);
  const isMainnet = await w.isMainnet();
  console.log(isMainnet);
  const tokens = await w.getTokens();
  console.log(tokens);

  // const wallet = await mkLucidWallet(lucid, config.seedPhrase);
  // console.log(wallet);
  // console.log(G.Contract);
  // console.log(mkLucidWallet);

}

await main();
