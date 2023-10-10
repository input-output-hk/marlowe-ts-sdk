import * as t from "io-ts/lib/index.js";
import { ContractGuard } from "./contract.js";
import {
  ChoiceId,
  ChoiceIdGuard,
  ChosenNum,
  ChosenNumGuard,
} from "./choices.js";
import { Party, PartyGuard } from "./participants.js";
import { AccountId, AccountIdGuard } from "./payee.js";
import { Token, TokenGuard } from "./token.js";

/**
 * TODO: Comment
 * @see Section 2.1.6 and appendix E.11 of the {@link https://github.com/input-output-hk/marlowe/releases/download/v3/Marlowe.pdf | Marlowe spec}
 * @category Input
 */
export interface IChoice {
  for_choice_id: ChoiceId;
  input_that_chooses_num: ChosenNum;
}

/**
 * TODO: Comment
 * @see Section 2.1.6 and appendix E.11 of the {@link https://github.com/input-output-hk/marlowe/releases/download/v3/Marlowe.pdf | Marlowe spec}
 * @category Input
 */
export const IChoiceGuard: t.Type<IChoice> = t.type({
  for_choice_id: ChoiceIdGuard,
  input_that_chooses_num: ChosenNumGuard,
});

/**
 * TODO: Comment
 * @see Section 2.1.6 and appendix E.11 of the {@link https://github.com/input-output-hk/marlowe/releases/download/v3/Marlowe.pdf | Marlowe spec}
 * @category Input
 */
export interface IDeposit {
  input_from_party: Party;
  that_deposits: bigint;
  of_token: Token;
  into_account: AccountId;
}

/**
 * TODO: Comment
 * @see Section 2.1.6 and appendix E.11 of the {@link https://github.com/input-output-hk/marlowe/releases/download/v3/Marlowe.pdf | Marlowe spec}
 * @category Input
 */
export const IDepositGuard = t.type({
  input_from_party: PartyGuard,
  that_deposits: t.bigint,
  of_token: TokenGuard,
  into_account: AccountIdGuard,
});

/**
 * Search [[lower-name-builders]]
 * @hidden
 */
export const inputNotify = "input_notify";

/**
 * TODO: Comment
 * @see Section 2.1.6 and appendix E.11 of the {@link https://github.com/input-output-hk/marlowe/releases/download/v3/Marlowe.pdf | Marlowe spec}
 * @category Input
 */
export type INotify = "input_notify";

/**
 * TODO: Comment
 * @see Section 2.1.6 and appendix E.11 of the {@link https://github.com/input-output-hk/marlowe/releases/download/v3/Marlowe.pdf | Marlowe spec}
 * @category Input
 */
export const INotifyGuard: t.Type<INotify> = t.literal("input_notify");

// Maybe this should be a newtype
/**
 * TODO: Comment
 * @category Input
 */
// TODO: Try to make nominal as this gets replaced in the documentation and an interface
//       cannot extend from builting type string.
export type BuiltinByteString = string;

/**
 * TODO: Comment
 * @category Input
 */
export const BuiltinByteStringGuard: t.Type<BuiltinByteString> = t.string;
/**
 * TODO: Comment
 * @category Input
 */
export type InputContent = IDeposit | IChoice | INotify;
/**
 * TODO: Comment
 * @category Input
 */
export const InputContentGuard: t.Type<InputContent> = t.union([
  IDepositGuard,
  IChoiceGuard,
  INotifyGuard,
]);

/**
 * TODO: Comment
 * @category Input
 */
export type NormalInput = InputContent;

/**
 * TODO: Comment
 * @category Input
 */
export const NormalInputGuard = InputContentGuard;

/**
 * TODO: Revisit
 * @category Input
 */
export type MerkleizedInput = t.TypeOf<typeof MerkleizedInputGuard>;
/**
 * TODO: Revisit
 * @category Input
 */
export const MerkleizedInputGuard = t.intersection([
  InputContentGuard,
  t.partial({
    continuation_hash: BuiltinByteStringGuard,
    merkleized_continuation: ContractGuard,
  }),
]);

/**
 * TODO: Revisit
 * @category Input
 */
export type Input = NormalInput | MerkleizedInput;
/**
 * TODO: Revisit
 * @category Input
 */
export const InputGuard: t.Type<Input> = t.union([
  NormalInputGuard,
  MerkleizedInputGuard,
]);
