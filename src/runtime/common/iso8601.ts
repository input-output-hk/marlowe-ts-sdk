import * as t from "io-ts";
import { pipe } from "fp-ts/lib/function";
import formatISO from 'date-fns/formatISO'

export type ISO8601 = t.TypeOf<typeof ISO8601>
export const ISO8601 = t.string 


export const datetoIso8601 = (date:Date):ISO8601 => pipe(date,formatISO)

