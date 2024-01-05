import { Network, NetworkGuard, getNetwork } from "@marlowe.io/runtime-core";
import { formatValidationErrors } from "jsonbigint-io-ts-reporters";
import { unsafeEither } from "@marlowe.io/adapter/fp-ts";
import * as E from "fp-ts/lib/Either.js";
import { Blockfrost } from "lucid-cardano";
import { SeedPhrase, seedPhrase } from "./seedPhrase.js";
import {
  RestClient,
  mkRestClient,
  RuntimeVersion,
} from "@marlowe.io/runtime-rest-client";
import * as Lucid from "lucid-cardano";
import * as G from "@marlowe.io/runtime-rest-client/guards";
import { MarloweJSON } from "@marlowe.io/adapter/codec";

const toLucidNetwork = (network: Network): Lucid.Network => {
  switch (network) {
    case "private":
      return "Custom";
    case "preview":
      return "Preview";
    case "preprod":
      return "Preprod";
    case "mainnet":
      return "Mainnet";
  }
};

export type TestConfiguration = {
  bank: { seedPhrase: SeedPhrase };
  lucid: { blockfrost: Blockfrost; node: { network: Lucid.Network } };
  runtime: {
    version: RuntimeVersion;
    url: URL;
    client: RestClient;
    node: { network: Network };
  };
};

export const readTestConfiguration = async (): Promise<TestConfiguration> => {
  const runtimeURL = readRuntimeURL();
  const lucidNetwork = readLucidNodeNetwork();
  const runtimeClient = mkRestClient(runtimeURL.toString());
  const status = await runtimeClient.getRuntimeStatus();
  const runtimeNodeNetwork = getNetwork(status.networkId);

  if (!G.CompatibleRuntimeVersion.is(status.version)) {
    throw {
      message: "Runtime Version is not Compatible with the ts-sdk",
      details: MarloweJSON.stringify(status),
    };
  }

  const configuration = {
    bank: { seedPhrase: readBankSeedPhrase() },
    lucid: {
      blockfrost: readBlockfrost(),
      node: { network: toLucidNetwork(lucidNetwork) },
    },
    runtime: {
      version: status.version,
      url: runtimeURL,
      client: mkRestClient(runtimeURL.toString()),
      node: { network: runtimeNodeNetwork },
    },
  };
  return configuration;
};

const readBlockfrost = (): Blockfrost => {
  const { BLOCKFROST_URL, BLOCKFROST_PROJECT_ID } = process.env;
  if (BLOCKFROST_URL == undefined)
    throw "Test environment variable not defined (BLOCKFROST_URL)";
  if (BLOCKFROST_PROJECT_ID == undefined)
    throw "Test environment variable not defined (BLOCKFROST_PROJECT_ID)";
  return new Blockfrost(BLOCKFROST_URL, BLOCKFROST_PROJECT_ID);
};

const readLucidNodeNetwork = (): Network => {
  const { NETWORK_NAME } = process.env;
  if (NETWORK_NAME == undefined)
    throw "Test environment variable not defined (NETWORK_NAME) ";
  return unsafeEither(
    E.mapLeft(formatValidationErrors)(NetworkGuard.decode(NETWORK_NAME))
  );
};

const readBankSeedPhrase = (): SeedPhrase => {
  const { BANK_SEED_PHRASE } = process.env;
  if (BANK_SEED_PHRASE !== undefined) {
    return seedPhrase(JSON.parse(BANK_SEED_PHRASE));
  } else {
    throw "environment configurations not available (BANK_PK_HEX)";
  }
};

const readRuntimeURL = () => {
  const { MARLOWE_WEB_SERVER_URL } = process.env;
  if (MARLOWE_WEB_SERVER_URL == undefined)
    throw "environment configurations not available(MARLOWE_WEB_SERVER_URL)";
  return new URL(MARLOWE_WEB_SERVER_URL);
};
