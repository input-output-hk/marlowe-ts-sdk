/**
 * This module defines the participant types as defined in the Marlowe Specification.
 * @see Section 2.1.1 of the {@link https://github.com/input-output-hk/marlowe/releases/download/v3/specification-v3.pdf | Marlowe Specification}
 * @packageDocumentation
 */
import * as t from "io-ts/lib/index.js";
import { pipe } from "fp-ts/lib/function.js";
import * as A from "fp-ts/lib/Array.js";

import { AddressBech32 } from "./address.js";

/**
 * TODO: Comment
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
