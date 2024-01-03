import {
  mkFPTSRestClient,
  mkRestClient,
} from "@marlowe.io/runtime-rest-client";
import * as Wallet from "@marlowe.io/wallet/lucid";
import * as Generic from "../generic/runtime.js";
import { RuntimeLifecycle } from "../api.js";
import { Lucid } from "lucid-cardano";

export const mkRuntimeLifecycle = async (
  runtimeURL: string,
  lucid: Lucid
): Promise<RuntimeLifecycle> => {
  const wallet = await Wallet.mkLucidWallet(lucid);
  const deprecatedRestAPI = mkFPTSRestClient(runtimeURL);
  const restClient = mkRestClient(runtimeURL);
  return Generic.mkRuntimeLifecycle(deprecatedRestAPI, restClient, wallet);
};
