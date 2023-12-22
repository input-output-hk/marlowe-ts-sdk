import { pipe } from "fp-ts/lib/function.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import * as O from "fp-ts/lib/Option.js";

import {
  mkFPTSRestClient,
  mkRestClient,
} from "@marlowe.io/runtime-rest-client";

import { getMarloweRuntimeUrl } from "../context.js";

import console from "console";
global.console = console;

describe("payouts endpoints", () => {
  const restClient = mkRestClient(getMarloweRuntimeUrl());

  it(
    "can navigate throught payout headers" + "(GET:  /payouts)",
    async () => {
      const firstPage = await restClient.getPayouts({
        contractIds: [],
        roleTokens: [],
      });
      expect(firstPage.payouts.length).toBe(100);
      expect(firstPage.page.total).toBeGreaterThan(100);

      expect(firstPage.page.next).toBeDefined();

      const secondPage = await restClient.getPayouts({
        contractIds: [],
        roleTokens: [],
        range: firstPage.page.next,
      });
      expect(secondPage.payouts.length).toBe(100);
      expect(secondPage.page.total).toBeGreaterThan(100);

      expect(secondPage.page.next).toBeDefined();

      const thirdPage = await restClient.getPayouts({
        contractIds: [],
        roleTokens: [],
        range: secondPage.page.next,
      });

      expect(thirdPage.payouts.length).toBe(100);
      expect(thirdPage.page.total).toBeGreaterThan(100);

      expect(thirdPage.page.next).toBeDefined();
    },
    100_000
  );
});
