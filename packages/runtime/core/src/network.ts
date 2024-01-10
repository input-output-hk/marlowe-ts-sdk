import * as t from "io-ts/lib/index.js";

export type NetworkId = bigint;
export type Network = "preview" | "preprod" | "mainnet" | "private";

export const NetworkGuard: t.Type<Network, string> = t.union([
  t.literal("preview"),
  t.literal("preprod"),
  t.literal("mainnet"),
  t.literal("private"),
]);

export const getNetwork = (networkId: NetworkId): Network => {
  switch (networkId) {
    case 0n:
      return "mainnet";
    case 1n:
      return "preprod";
    case 2n:
      return "preview";
    default:
      return "private";
  }
};
