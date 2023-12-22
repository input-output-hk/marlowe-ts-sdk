import * as t from "io-ts/lib/index.js";
import { unsafeEither } from "@marlowe.io/adapter/fp-ts";

export interface PolicyIdBrand {
  readonly PolicyId: unique symbol;
}

export const PolicyIdGuard = t.brand(
  t.string,
  (s): s is t.Branded<string, PolicyIdBrand> => true,
  "PolicyId"
);

export type PolicyId = t.TypeOf<typeof PolicyIdGuard>;

export const policyId = (s: string) => unsafeEither(PolicyIdGuard.decode(s));
