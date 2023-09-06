import { mkRestClient } from "@marlowe.io/runtime-rest-client/index.js";
import console from "console";
import { getMarloweRuntimeUrl } from "../context.js";

global.console = console;

describe.skip("ransactions endpoints", () => {
  const restClient = mkRestClient(getMarloweRuntimeUrl());

  it(
    "can navigate throught transaction headers" +
      "(GET:  /contracts/{contractd}/transactions)",
    async () => {
      // TODO
    }
  );
});
