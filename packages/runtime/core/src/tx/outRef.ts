import * as t from "io-ts/lib/index.js";
import { iso, Newtype } from "newtype-ts";
import { fromNewtype } from "io-ts-types";

export type TxOutRef = Newtype<{ readonly TxOutRef: unique symbol }, string>;
export const TxOutRef = fromNewtype<TxOutRef>(t.string);
export const unTxOutRef = iso<TxOutRef>().unwrap;
export const txOutRef = iso<TxOutRef>().wrap;
