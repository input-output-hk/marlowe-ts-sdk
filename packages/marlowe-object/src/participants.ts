import * as t from "io-ts/lib/index.js";
import { Address, Role } from "@marlowe.io/language-core-v1";
import * as G from "@marlowe.io/language-core-v1/guards";
import { Reference, ReferenceGuard } from "./reference.js";

export { Address, Role };

/**
 * Marlowe Object version of {@link @marlowe.io/language-core-v1!index.Party | Core Party} with
 * the ability to reference other parties.
 * @category Party
 */
export type Party = Address | Role | Reference;

/**
 * {@link !io-ts-usage | Dynamic type guard} for the {@link Party | party type}.
 * @category Party
 */
export const PartyGuard = t.union([G.Address, G.Role, ReferenceGuard]);
