import { mkFPTSRestClient } from "@marlowe.io/runtime-rest-client";
import console from "console";
import { getMarloweRuntimeUrl } from "../context.js";

global.console = console;

describe("Transactions endpoints", () => {
  const restClient = mkFPTSRestClient(getMarloweRuntimeUrl());

  it(
    "can navigate throught transaction headers" +
      "(GET:  /contracts/{contractd}/transactions)",
    async () => {
      // TODO
    }
  );
});
