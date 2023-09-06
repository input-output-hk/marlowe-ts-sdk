import { foo } from "@marlowe.io/wallet/nodejs";

describe("wallet", () => {
  it("succeeds", () => {
    expect(foo).toStrictEqual(42);
  });
});
