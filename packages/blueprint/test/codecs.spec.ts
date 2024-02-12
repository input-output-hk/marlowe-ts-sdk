import { DateFromEpochMS, StringCodec } from "../src/codecs.js";
import * as t from "io-ts/lib/index.js";
describe("DateFromEpochMS", () => {
  it("should decode a number as a Date", () => {
    const aDate = DateFromEpochMS.decode(1704067200000);
    expect(aDate).toEqual(t.success(new Date("2024-01-01T00:00:00.000Z")));
  });
  it("should fail to decode a string", () => {
    const aDate = DateFromEpochMS.decode("1704067200000");
    expect(aDate).toHaveProperty("_tag", "Left");
  });
  it("should encode a date as a number", () => {
    const aDate = DateFromEpochMS.encode(new Date("2024-01-01T00:00:00.000Z"));
    expect(aDate).toEqual(1704067200000);
  });
});

describe("StringCodec", () => {
  it("should decode a small string", () => {
    const aString = StringCodec.decode(["hello"]);
    expect(aString).toEqual(t.success("hello"));
  });
  it("it should merge two strings", () => {
    const aString = StringCodec.decode(["hello", "world"]);
    expect(aString).toEqual(t.success("helloworld"));
  });
  it("should encode a small string as a single element array", () => {
    const aString = StringCodec.encode("hello");
    expect(aString).toEqual(["hello"]);
  });
  it("should split a string longer that 64 characters", () => {
    const aString = StringCodec.encode("a".repeat(65));
    expect(aString).toEqual(["a".repeat(64), "a"]);
  });
  it("should fail to decode a number", () => {
    const aString = StringCodec.decode(42);
    expect(aString).toHaveProperty("_tag", "Left");
  });
});
