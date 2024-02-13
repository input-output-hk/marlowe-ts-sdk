import * as t from "io-ts/lib/index.js";
import { StringUnder64, StringUnder64Guard } from "@marlowe.io/runtime-core";
import {
  BigIntOrNumber,
  BigIntOrNumberGuard,
} from "@marlowe.io/adapter/bigint";

const DateCodec = new t.Type<Date, number, BigIntOrNumber>(
  "Date",
  (num): num is Date => num instanceof Date,
  (num, ctx) => {
    num = Number(num);
    const date = new Date(num);
    return t.success(date);
  },
  (dte) => dte.getTime()
);

export const DateFromEpochMS = BigIntOrNumberGuard.pipe(DateCodec);

const StringSplitCodec = new t.Type<string, StringUnder64[], StringUnder64[]>(
  "StringSplit",
  (str): str is string => typeof str === "string",
  (str, ctx) => {
    return t.success(str.join(""));
  },
  (str) => {
    const splitted = str.match(/(.|[\r\n]){1,64}/g) ?? [];
    return splitted as StringUnder64[];
  }
);

export const StringCodec: t.Type<string, string[], unknown> = t
  .array(StringUnder64Guard)
  .pipe(StringSplitCodec);
