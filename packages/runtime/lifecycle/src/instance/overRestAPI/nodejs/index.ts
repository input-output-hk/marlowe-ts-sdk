import { mkRestClient } from "@marlowe.io/runtime-rest-client/index.js";
import * as S from "@marlowe.io/wallet/nodejs";
import * as Generic from "../index.js";

export async function mkRuntimeLifecycle({
  runtimeURL,
  context,
  privateKeyBech32,
}: {
  runtimeURL: string;
  context: S.Context;
  privateKeyBech32: string;
}) {
  const wallet = await S.SingleAddressWallet.Initialise(
    context,
    privateKeyBech32
  );

  const restClient = mkRestClient(runtimeURL);
  return Generic.mkRuntimeLifecycle(restClient, wallet);
}
