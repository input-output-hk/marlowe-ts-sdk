import { mkRestClient } from "@marlowe.io/runtime-rest-client";

import { getMarloweRuntimeUrl } from "../context.js";

import console from "console";
import * as G from "@marlowe.io/runtime-rest-client/guards";
import { MarloweJSON } from "@marlowe.io/adapter/codec";

global.console = console;

describe("Runtime", () => {
  const restClient = mkRestClient(getMarloweRuntimeUrl());
  it("is deployed with a version compatible with @marlowe.io/runtime-rest-client.", async () => {
    const status = await restClient.getRuntimeStatus();
    console.log("status", MarloweJSON.stringify(status));
    expect(G.CompatibleRuntimeVersion.is(status.version)).toBe(true);
  }, 100_000);
});
