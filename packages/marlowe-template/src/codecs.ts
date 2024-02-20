import * as t from "io-ts/lib/index.js";
import { StringUnder64, StringUnder64Guard } from "@marlowe.io/runtime-core";
import {
  BigIntOrNumber,
  BigIntOrNumberGuard,
} from "@marlowe.io/adapter/bigint";
import { Token } from "@marlowe.io/language-core-v1";
import * as CoreG from "@marlowe.io/language-core-v1/guards";

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

export const StringCodec: t.Type<string, StringUnder64[], unknown> = t
  .array(StringUnder64Guard)
  .pipe(StringSplitCodec);

const TokenFromTuple = new t.Type<Token, [string, string], [string, string]>(
  "TokenFromTuple",
  CoreG.Token.is,
  ([currency_symbol, token_name], ctx) => {
    return t.success({ currency_symbol, token_name });
  },
  ({ currency_symbol, token_name }) => {
    return [currency_symbol, token_name];
  }
);

export const TokenCodec = t
  .tuple([StringCodec, StringCodec])
  .pipe(TokenFromTuple);
