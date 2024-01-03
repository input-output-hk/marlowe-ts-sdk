import { Network, NetworkGuard, getNetwork } from "@marlowe.io/runtime-core";
import { Context, getPrivateKeyFromHexString } from "@marlowe.io/wallet/nodejs";
import { formatValidationErrors } from "jsonbigint-io-ts-reporters";
import { unsafeEither, unsafeTaskEither } from "@marlowe.io/adapter/fp-ts";
import * as E from "fp-ts/lib/Either.js";

export function getBlockfrostContext(): Context {
  const { BLOCKFROST_URL, BLOCKFROST_PROJECT_ID } = process.env;
  if (BLOCKFROST_URL == undefined)
    throw "Test environment variable not defined (BLOCKFROST_URL)";
  if (BLOCKFROST_PROJECT_ID == undefined)
    throw "Test environment variable not defined (BLOCKFROST_PROJECT_ID)";

  return new Context(
    BLOCKFROST_PROJECT_ID as string,
    BLOCKFROST_URL as string,
    getNetworkTestConfiguration()
  );
}

export const getNetworkTestConfiguration = (): Network => {
  const { NETWORK_NAME } = process.env;
  if (NETWORK_NAME == undefined)
    throw "Test environment variable not defined (NETWORK_NAME) ";
  return unsafeEither(
    E.mapLeft(formatValidationErrors)(NetworkGuard.decode(NETWORK_NAME))
  );
};


export function getBankSeedPhrase(): string[] {
  const { BANK_SEED_PHRASE } = process.env;
  if (BANK_SEED_PHRASE !== undefined) {
    return JSON.parse(BANK_SEED_PHRASE);
  } else {
    throw "environment configurations not available (BANK_PK_HEX)";
  }
}

export function getMarloweRuntimeUrl(): string {
  const { MARLOWE_WEB_SERVER_URL } = process.env;
  if (MARLOWE_WEB_SERVER_URL == undefined)
    throw "environment configurations not available(MARLOWE_WEB_SERVER_URL)";
  return MARLOWE_WEB_SERVER_URL as string;
}
