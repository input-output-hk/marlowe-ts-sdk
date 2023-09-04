import * as T from "fp-ts/lib/Task.js";
import { pipe } from "fp-ts/lib/function.js";

import { getExtensionInstance } from "@marlowe.io/wallet/browser";
import * as Generic from "../index.js";
import { RuntimeLifecycle } from "../../../apis/runtimeLifecycle.js";

import { mkRestClient } from "@marlowe.io/runtime-rest-client";

export const mkRuntimeLifecycle: (
  runtimeURL: string
) => (extensionName: string) => T.Task<RuntimeLifecycle> =
  (runtimeURL) => (extensionName) =>
    pipe(
      getExtensionInstance(extensionName),
      T.map(Generic.mkRuntimeLifecycle(mkRestClient(runtimeURL)))
    );
