import { BlueprintOf, mkBlueprint } from "@marlowe.io/marlowe-template";
describe("Blueprint basic types", () => {
  const basicBlueprint = mkBlueprint({
    name: "Basic types Blueprint",
    description: "A test blueprint with basic types",
    params: [
      { name: "str", type: "string", description: "A string" },
      { name: "num", type: "value", description: "A number" },
      { name: "dte", type: "date", description: "A date" },
    ] as const,
  });

  /** The inferred type from the Blueprint should be
    {
      str: string,
      num: BigIntOrNumber,
      dte: Date
    }
   */
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
    const a: BasicBlueprint = { str: "hello", num: 42, dte: aDate };
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

  it("should split a long string when encoding", () => {
    const a: BasicBlueprint = {
      str: "a".repeat(65),
      num: 42n,
      dte: aDate,
    };
    expect(basicBlueprint.encode(a)).toEqual({
      "9041": {
        v: 1n,
        params: [["a".repeat(64), "a"], 42n, aDateMS],
      },
    });
  });

  it("should merge a split string when decoding", () => {
    const metadata = {
      "9041": {
        v: 1n,
        params: [["a".repeat(64), "a"], 42n, aDateMS],
      },
    };
    expect(basicBlueprint.decode(metadata)).toEqual({
      str: "a".repeat(65),
      num: 42n,
      dte: aDate,
    });
  });
});
