import * as t from "io-ts/lib/index.js";
import { pipe } from "fp-ts/lib/function.js";
import { format, formatISO } from "date-fns";

export type ISO8601 = t.TypeOf<typeof ISO8601>;
export const ISO8601 = t.string;

export type POSIXTime = t.TypeOf<typeof POSIXTime>;
export const POSIXTime = t.bigint;

export const posixTimeToIso8601 = (posixTime: POSIXTime): ISO8601 =>
  datetoIso8601(new Date(Number(posixTime)));

export const datetoIso8601 = (date: Date): ISO8601 => date.toISOString();

export const iso8601ToPosixTime = (iso8601: ISO8601): POSIXTime =>
  BigInt(new Date(iso8601).getTime());

// a minute in milliseconds
export const MINUTES = 1000 * 60;
