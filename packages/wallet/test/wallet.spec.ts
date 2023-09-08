import { getPrivateKeyFromHexString } from "@marlowe.io/wallet/nodejs";

describe("wallet", () => {
  it("succeeds", () => {
    expect(getPrivateKeyFromHexString).toBeDefined();
  });
});
