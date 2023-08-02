import { optionFromNullable } from "io-ts-types";
import * as t from "io-ts";
import { CanDeposit } from "./canDeposit";
import { CanChoose } from "./canChoose";
import { CanNotify } from "./canNotify";


export type ApplicableInputs = t.TypeOf<typeof ApplicableInputs>
export const ApplicableInputs 
  = t.type(
      { notify: optionFromNullable(CanNotify)
      , deposits: t.array(CanDeposit)
      , choices: t.array(CanChoose)
    })