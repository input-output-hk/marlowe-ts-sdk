import * as t from "io-ts/lib/index.js";
import { Contract } from "./contract.js";
import { ChoiceId } from "./value-and-observation.js";
import { Party } from "./participants.js";
import { AccountId } from "./payee.js";
import { Token } from "./token.js";

export type ChosenNum = t.TypeOf<typeof ChosenNum>;
export const ChosenNum = t.bigint;

export type InputChoice = t.TypeOf<typeof InputChoice>;
export const InputChoice = t.type({
  for_choice_id: ChoiceId,
  input_that_chooses_num: ChosenNum,
});

export type InputDeposit = t.TypeOf<typeof InputDeposit>;
export const InputDeposit = t.type({
  input_from_party: Party,
  that_deposits: t.bigint,
  of_token: Token,
  into_account: AccountId,
});

export const inputNotify = "input_notify";
export type InputNotify = t.TypeOf<typeof InputNotify>;
export const InputNotify = t.literal("input_notify");

// Maybe this should be a newtype
export type BuiltinByteString = t.TypeOf<typeof BuiltinByteString>;
export const BuiltinByteString = t.string;

export type InputContent = t.TypeOf<typeof InputContent>;
export const InputContent = t.union([InputDeposit, InputChoice, InputNotify]);

export type NormalInput = t.TypeOf<typeof NormalInput>;
export const NormalInput = InputContent;

export type MerkleizedInput = t.TypeOf<typeof MerkleizedInput>;
export const MerkleizedInput = t.intersection([
  InputContent,
  t.partial({
    continuation_hash: BuiltinByteString,
    merkleized_continuation: Contract,
  }),
]);

export type Input = t.TypeOf<typeof Input>;
export const Input = t.union([NormalInput, MerkleizedInput]);
