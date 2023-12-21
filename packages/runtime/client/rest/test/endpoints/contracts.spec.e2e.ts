import { mkRestClient } from "@marlowe.io/runtime-rest-client";

import { getMarloweRuntimeUrl } from "../context.js";

import console from "console";

global.console = console;

describe("contracts endpoints", () => {
  const restClient = mkRestClient(getMarloweRuntimeUrl());

  it(
    "can navigate throught Marlowe Contracts pages" + "(GET:  /contracts/)",
    async () => {
      const firstPage = await restClient.getContracts({
        tags: [],
        partyAddresses: [],
        partyRoles: [],
      });
      expect(firstPage.contracts.length).toBe(100);
      expect(firstPage.page.total).toBeGreaterThan(100);

      expect(firstPage.page.next).toBeDefined();

      const secondPage = await restClient.getContracts({
        range: firstPage.page.next,
      });
      expect(secondPage.contracts.length).toBe(100);
      expect(secondPage.page.total).toBeGreaterThan(100);

      expect(secondPage.page.next).toBeDefined();

      const thirdPage = await restClient.getContracts({
        range: secondPage.page.next,
      });

      expect(thirdPage.contracts.length).toBe(100);
      expect(thirdPage.page.total).toBeGreaterThan(100);

      expect(thirdPage.page.next).toBeDefined();
    },
    100_000
  );
});
