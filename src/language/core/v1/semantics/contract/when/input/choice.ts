import * as t from "io-ts";
import { ChoiceId } from "../../common/value";

export type  ChosenNum = t.TypeOf<typeof ChosenNum>
export const ChosenNum = t.bigint

export type InputChoice = t.TypeOf<typeof InputChoice>
export const InputChoice  
   = t.type ({ for_choice_id: ChoiceId
             , input_that_chooses_num: ChosenNum })