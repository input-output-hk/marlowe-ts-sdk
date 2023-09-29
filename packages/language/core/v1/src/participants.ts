/**
 * This module defines the participant types as defined in the Marlowe Specification.
 * @see Section 2.1.1 of the {@link https://github.com/input-output-hk/marlowe/releases/download/v3/specification-v3.pdf | Marlowe Specification}
 * @packageDocumentation
 */
import * as t from "io-ts/lib/index.js";
import { pipe } from "fp-ts/lib/function.js";
import * as A from "fp-ts/lib/Array.js";

import { AddressBech32 } from "./address.js";

export type Address = t.TypeOf<typeof Address>;
export const Address = t.type({ address: AddressBech32 });

type RoleName = t.TypeOf<typeof RoleName>;
const RoleName = t.string;

export const role = (roleToken: RoleName) => ({ role_token: roleToken });
export type Role = t.TypeOf<typeof Role>;
export const Role = t.type({ role_token: RoleName });

export const party = (party: Role | Address) => party;
export type Party = t.TypeOf<typeof Party>;
export const Party = t.union([Address, Role]);

export const partiesToStrings: (parties: Party[]) => string[] = (parties) =>
  pipe(parties, A.map(partyToString));

export const partyToString: (party: Party) => string = (party) =>
  Role.is(party) ? party.role_token : party.address;
