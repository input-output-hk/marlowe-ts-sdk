import { AxiosInstance } from "axios";
import * as HTTP from "@marlowe.io/adapter/http";
import { unsafeEither, unsafeTaskEither } from "@marlowe.io/adapter/fp-ts";
import { ISO8601 } from "@marlowe.io/adapter/time";
import {
  BlockHeader,
  BlockHeaderGuard,
  NetworkId,
  bigintGuard,
} from "@marlowe.io/runtime-core";
import { formatValidationErrors } from "jsonbigint-io-ts-reporters";
import * as E from "fp-ts/lib/Either.js";
import * as t from "io-ts/lib/index.js";
import { MarloweJSON, MarloweJSONCodec } from "@marlowe.io/adapter/codec";
export type BlockHash = string;

export type RuntimeVersion = string;

export type CompatibleRuntimeVersion = "0.0.6" | "0.0.5";

export const CompatibleRuntimeVersionGuard: t.Type<
  CompatibleRuntimeVersion,
  string
> = t.union([t.literal("0.0.6"), t.literal("0.0.5")]);

/**
 *  A **Tip** represents the last block read in a "projection" process.
 *  In the context of Cardano and Blockchain in general, a Projection is about deriving a state from a ledger by streaming the block events.
 *  These States (e.g : contract details) are eventually consistent, and the Tip gives you an approximate notion on how freshly updated they are.
 */
export type Tip = {
  /**
   * Last Block Header Read
   */
  blockHeader: BlockHeader;
  /**
   * Last Slot Read in UTC time
   */
  slotTimeUTC: ISO8601;
};
/**
 * @hidden
 */
export const TipGuard = t.type({
  slotTimeUTC: ISO8601,
  blockHeader: BlockHeaderGuard,
});

/**
 *  Set of information about the runtime hosted
 */
export type RuntimeStatus = {
  /**
   * Network ID of the node connected to the runtime
   */
  networkId: NetworkId;
  /**
   * Runtime Version Deployed
   */
  version: RuntimeVersion;
  /**
   * Set of Tips providing information on how healthy is the flow of Projections :  Node > Runtime Chain > Runtime
   * The Runtime Tip indicates if the information Queried is up to date. The Node and the Runtime Chain Tips are
   * here to help the diagnostic of a Runtime Tip that would be too long in the past or not being updated anymore.
   */
  tips: {
    node: Tip;
    runtimeChain: Tip;
    runtime: Tip;
  };
};

export const healthcheck = async (
  axiosInstance: AxiosInstance
): Promise<RuntimeStatus> => {
  const headers = await unsafeTaskEither(
    HTTP.GetWithHeaders(axiosInstance)("/healthcheck")
  );

  return {
    networkId: headers["x-network-id"],
    version: headers["x-runtime-version"],
    tips: {
      node: unsafeEither(
        E.mapLeft(formatValidationErrors)(
          TipGuard.decode(MarloweJSONCodec.decode(headers["x-node-tip"]))
        )
      ),
      runtimeChain: unsafeEither(
        E.mapLeft(formatValidationErrors)(
          TipGuard.decode(
            MarloweJSONCodec.decode(headers["x-runtime-chain-tip"])
          )
        )
      ),
      runtime: unsafeEither(
        E.mapLeft(formatValidationErrors)(
          TipGuard.decode(MarloweJSONCodec.decode(headers["x-runtime-tip"]))
        )
      ),
    },
  };
};
