import * as t from "io-ts";
import { Bound } from "../../contract/when/action/choice";
import { ChoiceId } from "../../contract/common/value";
import { IsMerkleizedContinuation } from "../common/IsMerkleizedContinuation";
import { CaseIndex } from "../common/caseIndex";
import { ChosenNum, InputChoice } from "../../contract/when/input/choice";


export type CanChoose = t.TypeOf<typeof CanChoose>
export const CanChoose 
    = t.type(
        { case_index: CaseIndex
        , for_choice : ChoiceId
        , can_choose_between : t.array(Bound)
        , is_merkleized_continuation: IsMerkleizedContinuation
    })

export const toInput : (canChoose : CanChoose) => (chosenNum : ChosenNum) => (InputChoice) =
    (canChoose) => (chosenNum) =>
      ({ for_choice_id: canChoose.for_choice
       , input_that_chooses_num: chosenNum })