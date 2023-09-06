import { mkRestClient } from "@marlowe.io/runtime-rest-client/index.js";
import * as T from "fp-ts/lib/Task.js";
import { pipe } from "fp-ts/lib/function.js";

import * as S from "@marlowe.io/wallet/nodejs";
import * as Generic from "../index.js";
import { RuntimeLifecycle } from "../../../apis/runtimeLifecycle.js";

export const mkRuntimeLifecycle: (
  runtimeURL: string
) => (
  context: S.Context
) => (privateKeyBech32: string) => T.Task<RuntimeLifecycle> =
  (runtimeURL) => (context) => (privateKeyBech32) =>
    pipe(
      S.SingleAddressWallet.Initialise(context, privateKeyBech32),
      T.map(Generic.mkRuntimeLifecycle(mkRestClient(runtimeURL)))
    );
