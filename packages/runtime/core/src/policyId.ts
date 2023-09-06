import * as t from "io-ts/lib/index.js";
import { iso, Newtype } from "newtype-ts";
import { fromNewtype } from "io-ts-types";

export type PolicyId = Newtype<{ readonly PolicyId: unique symbol }, string>;
export const PolicyId = fromNewtype<PolicyId>(t.string);
export const unPolicyId = iso<PolicyId>().unwrap;
export const mkPolicyId = iso<PolicyId>().wrap;
