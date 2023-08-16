import { optionFromNullable } from "io-ts-types";
import * as t from "io-ts/lib/index.js";
import { CanDeposit } from "./canDeposit.js";
import { CanChoose } from "./canChoose.js";
import { CanNotify } from "./canNotify.js";


export type ApplicableInputs = t.TypeOf<typeof ApplicableInputs>
export const ApplicableInputs
  = t.type(
      { notify: optionFromNullable(CanNotify)
      , deposits: t.array(CanDeposit)
      , choices: t.array(CanChoose)
    })