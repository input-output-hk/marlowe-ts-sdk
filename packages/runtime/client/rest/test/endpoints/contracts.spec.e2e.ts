import { readEnvConfigurationFile } from "@marlowe.io/testing-kit";

import console from "console";

global.console = console;

describe("contracts endpoints", () => {
  it(
    "can navigate throught some Marlowe Contracts pages" +
      "(GET:  /contracts/)",
    async () => {
      const { runtime } = await readEnvConfigurationFile();
      const firstPage = await runtime.client.getContracts({
        tags: [],
        partyAddresses: [],
        partyRoles: [],
      });
      expect(firstPage.contracts.length).toBe(100);
      expect(firstPage.page.total).toBeGreaterThan(100);

      expect(firstPage.page.next).toBeDefined();

      const secondPage = await runtime.client.getContracts({
        range: firstPage.page.next,
      });
      expect(secondPage.contracts.length).toBe(100);
      expect(secondPage.page.total).toBeGreaterThan(100);

      expect(secondPage.page.next).toBeDefined();

      const thirdPage = await runtime.client.getContracts({
        range: secondPage.page.next,
      });

      expect(thirdPage.contracts.length).toBe(100);
      expect(thirdPage.page.total).toBeGreaterThan(100);

      expect(thirdPage.page.next).toBeDefined();
    },
    100_000
  );
  it(
    "can retrieve some contract Details" + "(GET:  /contracts/{contractId})",
    async () => {
      const { runtime } = await readEnvConfigurationFile();
      const firstPage = await runtime.client.getContracts({
        tags: [],
        partyAddresses: [],
        partyRoles: [],
      });
      expect(firstPage.contracts.length).toBe(100);
      expect(firstPage.page.total).toBeGreaterThan(100);
      expect(firstPage.page.next).toBeDefined();

      await Promise.all(
        firstPage.contracts.map((contract) =>
          runtime.client.getContractById(contract.contractId)
        )
      );
    },
    100_000
  );
});
