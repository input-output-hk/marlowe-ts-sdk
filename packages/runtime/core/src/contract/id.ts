import * as t from "io-ts/lib/index.js";
import { split } from "fp-ts/lib/string.js";
import { pipe } from "fp-ts/lib/function.js";
import { head } from "fp-ts/lib/ReadonlyNonEmptyArray.js";
import { TxId } from "../tx/id.js";
import { unsafeEither } from "@marlowe.io/adapter/fp-ts";
import { preservedBrand } from "@marlowe.io/adapter/io-ts";

export interface ContractIdBrand {
  readonly ContractId: unique symbol;
}

export const ContractIdGuard = preservedBrand(
  t.string,
  (s): s is t.Branded<string, ContractIdBrand> => true,
  "ContractId"
);

export type ContractId = t.TypeOf<typeof ContractIdGuard>;

export const contractId = (s: string) =>
  unsafeEither(ContractIdGuard.decode(s));

export const contractIdToTxId: (contractId: ContractId) => TxId = (
  contractId
) => pipe(contractId, split("#"), head);
