import { mkRestClient } from "@marlowe.io/runtime-rest-client";
import { readTestConfiguration } from "@marlowe.io/testing-kit";

import console from "console";
global.console = console;

describe("payouts endpoints", () => {
  it(
    "can navigate throught payout headers" + "(GET:  /payouts)",
    async () => {
      const { runtime } = await readTestConfiguration();
      const firstPage = await runtime.client.getPayouts({
        contractIds: [],
        roleTokens: [],
      });
      expect(firstPage.payouts.length).toBe(100);
      expect(firstPage.page.total).toBeGreaterThan(100);

      expect(firstPage.page.next).toBeDefined();

      const secondPage = await runtime.client.getPayouts({
        contractIds: [],
        roleTokens: [],
        range: firstPage.page.next,
      });
      expect(secondPage.payouts.length).toBe(100);
      expect(secondPage.page.total).toBeGreaterThan(100);

      expect(secondPage.page.next).toBeDefined();

      const thirdPage = await runtime.client.getPayouts({
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
