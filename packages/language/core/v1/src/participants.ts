/**
 * This module defines the participant types as defined in the Marlowe Specification.
 * @see Section 2.1.1 of the {@link https://github.com/input-output-hk/marlowe/releases/download/v3/specification-v3.pdf | Marlowe Specification}
 * @packageDocumentation
 */
import * as t from "io-ts/lib/index.js";
import { pipe } from "fp-ts/lib/function.js";
import * as A from "fp-ts/lib/Array.js";

import { AddressBech32 } from "./address.js";
import { Sort, strCmp } from "@marlowe.io/adapter/assoc-map";

/**
 *

 ```
 const addressExample: Address = {"address" : "example address"}
 ```
 * @see Section 2.1.1 and appendix E.1 of the {@link https://github.com/input-output-hk/marlowe/releases/download/v3/Marlowe.pdf | Marlowe specification}
 * @category Party
 */
export interface Address {
  address: AddressBech32;
}
/**
 * TODO: Comment
 * @category Party
 */
export const AddressGuard: t.Type<Address> = t.type({ address: AddressBech32 });

type RoleName = string;
const RoleNameGuard: t.Type<RoleName> = t.string;

/**
 * Search [[lower-name-builders]]
 * @hidden
 */
export const role = (roleToken: RoleName) => ({ role_token: roleToken });

/**
 * TODO: Comment
 * @category Party
 */
export interface Role {
  role_token: RoleName;
}

/**
 * TODO: Comment
 * @category Party
 */
export const RoleGuard: t.Type<Role> = t.type({ role_token: RoleNameGuard });

/**
 * Search [[lower-name-builders]]
 * @hidden
 */
export const party = (party: Role | Address) => party;

/**
 * TODO: Comment
 * @category Party
 */
export type Party = Address | Role;
/**
 * TODO: Comment
 * @category Party
 */
export const PartyGuard = t.union([AddressGuard, RoleGuard]);

/**
 * @hidden
 */
export const partiesToStrings: (parties: Party[]) => string[] = (parties) =>
  pipe(parties, A.map(partyToString));

/**
 * @hidden
 */
export const partyToString: (party: Party) => string = (party) =>
  RoleGuard.is(party) ? party.role_token : party.address;

/**
 * Sorting function for Parties as defined in the Marlowe Specification (SemanticsGuarantees.thy)
 * @hidden
 */
export function partyCmp(a: Party, b: Party): Sort {
  if (AddressGuard.is(a) && RoleGuard.is(b)) {
    return "LowerThan";
  }
  if (RoleGuard.is(a) && AddressGuard.is(b)) {
    return "GreaterThan";
  }
  if (AddressGuard.is(a) && AddressGuard.is(b)) {
    return strCmp(a.address, b.address);
  }
  if (RoleGuard.is(a) && RoleGuard.is(b)) {
    return strCmp(a.role_token, b.role_token);
  }
  throw new Error("Unreachable");
}
