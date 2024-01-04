import * as t from "io-ts/lib/index.js";
import * as G from "@marlowe.io/language-core-v1/guards";
import * as fs from "fs/promises";

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
  runtimeURL: t.string,
});

export type Config = t.TypeOf<typeof configGuard>;

export async function readConfig(path = "./.config.json"): Promise<Config> {
  const configStr = await fs.readFile(path, { encoding: "utf-8" });
  const result = configGuard.decode(JSON.parse(configStr));
  if (result._tag === "Left") {
    throw new Error("Invalid config.json");
  }
  return result.right;
}
