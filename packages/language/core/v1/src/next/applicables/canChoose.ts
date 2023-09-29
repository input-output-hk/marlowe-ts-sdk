import * as t from "io-ts/lib/index.js";
import { ChosenNum, ChoiceIdGuard, BoundGuard } from "../../choices.js";
import { IsMerkleizedContinuation } from "../common/IsMerkleizedContinuation.js";
import { CaseIndex } from "../common/caseIndex.js";
import { IChoice } from "../../inputs.js";

export type CanChoose = t.TypeOf<typeof CanChoose>;
export const CanChoose = t.type({
  case_index: CaseIndex,
  for_choice: ChoiceIdGuard,
  can_choose_between: t.array(BoundGuard),
  is_merkleized_continuation: IsMerkleizedContinuation,
});

export const toInput: (
  canChoose: CanChoose
) => (chosenNum: ChosenNum) => IChoice = (canChoose) => (chosenNum) => ({
  for_choice_id: canChoose.for_choice,
  input_that_chooses_num: chosenNum,
});
