import { BlueprintOf, mkBlueprint } from "../src/typed.js";
describe("Blueprint basic types", () => {
  const basicBlueprint = mkBlueprint([
    { name: "str", type: "string", description: "A string" },
    { name: "num", type: "value", description: "A number" },
    { name: "dte", type: "date", description: "A date" },
  ] as const);

  type BasicBlueprint = BlueprintOf<typeof basicBlueprint>;
  const aDate = new Date("2024-01-01T00:00:00.000Z");
  const aDateMS = BigInt(aDate.getTime());

  it("should guard for correct values", () => {
    const a: BasicBlueprint = { str: "hello", num: 42n, dte: aDate };

    expect(basicBlueprint.is(a)).toBe(true);
  });

  it("should guard for incorrect values", () => {
    const a: BasicBlueprint = {
      /** @ts-expect-error */
      str: 42n,
      /** @ts-expect-error */
      num: "hello",
      dte: aDate,
    };
    expect(basicBlueprint.is(a)).toBe(false);
  });

  it("should encode a valid value", () => {
    const a: BasicBlueprint = { str: "hello", num: 42n, dte: aDate };
    expect(basicBlueprint.encode(a)).toEqual({
      "9041": {
        v: 1n,
        params: [["hello"], 42n, aDateMS],
      },
    });
  });
  it("should decode a valid value", () => {
    const metadata = {
      "9041": {
        v: 1n,
        params: [["hello"], 42n, aDateMS],
      },
    };

    expect(basicBlueprint.decode(metadata)).toEqual({
      str: "hello",
      num: 42n,
      dte: aDate,
    });
  });
});
