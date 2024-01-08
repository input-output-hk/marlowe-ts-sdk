import * as t from "io-ts/lib/index.js";
import { Action, ActionGuard } from "./actions.js";
import { Contract, ContractGuard } from "./contract.js";
import { Party, PartyGuard } from "./participants.js";
import { Label, LabelGuard } from "./reference.js";
import { Token, TokenGuard } from "./token.js";
import {
  ValueGuard,
  Value,
  Observation,
  ObservationGuard,
} from "./value-and-observation.js";

/**
 * Bundle of a {@link Label} that references a {@link Party}.
 * @category Object
 */
export interface ObjectParty {
  label: Label;
  type: "party";
  value: Party;
}

/**
 * {@link !io-ts-usage | Dynamic type guard} for the {@link ObjectParty | object party type}.
 * @category Object
 */
export const ObjectPartyGuard: t.Type<ObjectParty> = t.type({
  label: LabelGuard,
  type: t.literal("party"),
  value: PartyGuard,
});

/**
 * Bundle of a {@link Label} that references a {@link Value}.
 * @category Object
 */
export interface ObjectValue {
  label: Label;
  type: "value";
  value: Value;
}

/**
 * {@link !io-ts-usage | Dynamic type guard} for the {@link ObjectValue | object value type}.
 * @category Object
 */
export const ObjectValueGuard: t.Type<ObjectValue> = t.type({
  label: LabelGuard,
  type: t.literal("value"),
  value: ValueGuard,
});

/**
 * Bundle of a {@link Label} that references an {@link Observation}.
 * @category Object
 */
export interface ObjectObservation {
  label: Label;
  type: "observation";
  value: Observation;
}

/**
 * {@link !io-ts-usage | Dynamic type guard} for the {@link ObjectObservation | object observation type}.
 * @category Object
 */
export const ObjectObservationGuard: t.Type<ObjectObservation> = t.type({
  label: LabelGuard,
  type: t.literal("observation"),
  value: ObservationGuard,
});

/**
 * Bundle of a {@link Label} that references a {@link Token}.
 * @category Object
 */
export interface ObjectToken {
  label: Label;
  type: "token";
  value: Token;
}

/**
 * {@link !io-ts-usage | Dynamic type guard} for the {@link ObjectToken | object token type}.
 * @category Object
 */
export const ObjectTokenGuard: t.Type<ObjectToken> = t.type({
  label: LabelGuard,
  type: t.literal("token"),
  value: TokenGuard,
});

/**
 * Bundle of a {@link Label} that references a {@link Contract}.
 * @category Object
 */
export interface ObjectContract {
  label: Label;
  type: "contract";
  value: Contract;
}

/**
 * {@link !io-ts-usage | Dynamic type guard} for the {@link ObjectContract | object contract type}.
 * @category Object
 */
export const ObjectContractGuard: t.Type<ObjectContract> = t.type({
  label: LabelGuard,
  type: t.literal("contract"),
  value: ContractGuard,
});

/**
 * Bundle of a {@link Label} that references an {@link Action}.
 * @category Object
 */
export interface ObjectAction {
  label: Label;
  type: "action";
  value: Action;
}

/**
 * {@link !io-ts-usage | Dynamic type guard} for the {@link ObjectAction | object action type}.
 * @category Object
 */
export const ObjectActionGuard: t.Type<ObjectAction> = t.type({
  label: LabelGuard,
  type: t.literal("action"),
  value: ActionGuard,
});

/**
 * A bundle of a {@link Label} that references a {@link Party}, {@link Value}, {@link Observation}, {@link Token}, {@link Contract}, or {@link Action}.
 * @category Object
 */
export type ObjectType =
  | ObjectParty
  | ObjectValue
  | ObjectObservation
  | ObjectToken
  | ObjectContract
  | ObjectAction;

/**
 * {@link !io-ts-usage | Dynamic type guard} for the {@link ObjectType | object type}.
 * @category Object
 */
export const ObjectTypeGuard = t.union([
  ObjectPartyGuard,
  ObjectValueGuard,
  ObjectObservationGuard,
  ObjectTokenGuard,
  ObjectContractGuard,
  ObjectActionGuard,
]);

/**
 * A bundle of {@link ObjectType}s.
 * @category Object
 */
export type Bundle = ObjectType[];

/**
 * {@link !io-ts-usage | Dynamic type guard} for the {@link Bundle | bundle type}.
 * @category Object
 */
export const BundleGuard = t.array(ObjectTypeGuard);

/**
 * A contract bundle is just a {@link Bundle} with a main entrypoint.
 * @category Object
 */
export interface ContractBundle {
  main: Label;
  bundle: Bundle;
}

/**
 * {@link !io-ts-usage | Dynamic type guard} for the {@link ContractBundle | contract bundle type}.
 */
export const ContractBundleGuard: t.Type<ContractBundle> = t.type({
  main: LabelGuard,
  bundle: BundleGuard,
});
