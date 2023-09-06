import { Network } from "lucid-cardano";
import { Context, getPrivateKeyFromHexString } from "@marlowe.io/wallet/nodejs";

export function getBlockfrostContext(): Context {
  const { BLOCKFROST_URL, BLOCKFROST_PROJECT_ID, NETWORK_ID } = process.env;
  if (BLOCKFROST_URL == undefined)
    throw "environment configurations not available (BLOCKFROST_URL)";
  if (BLOCKFROST_PROJECT_ID == undefined)
    throw "environment configurations not available (BLOCKFROST_PROJECT_ID)";
  if (NETWORK_ID == undefined)
    throw "environment configurations not available (NETWORK_ID)";
  return new Context(
    BLOCKFROST_PROJECT_ID as string,
    BLOCKFROST_URL as string,
    NETWORK_ID as Network
  );
}

export function getBankPrivateKey(): string {
  const { BANK_PK_HEX } = process.env;
  if (BANK_PK_HEX == undefined)
    throw "environment configurations not available (BANK_PK_HEX)";
  return getPrivateKeyFromHexString(BANK_PK_HEX as string);
}

export function getMarloweRuntimeUrl(): string {
  const { MARLOWE_WEB_SERVER_URL } = process.env;
  if (MARLOWE_WEB_SERVER_URL == undefined)
    throw "environment configurations not available(MARLOWE_WEB_SERVER_URL)";
  return MARLOWE_WEB_SERVER_URL as string;
}
