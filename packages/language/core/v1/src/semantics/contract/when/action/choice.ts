import * as t from "io-ts/lib/index.js";
import { ChoiceId } from "../../common/value.js";

export type Bound
  = { from: bigint
    , to: bigint }

export const Bound : t.Type<Bound>
    = t.recursion('Bound', () =>
       t.type ({ from: t.bigint
               , to: t.bigint  }))

export type Choice =
   { choose_between: Bound[]
   , for_choice: ChoiceId }

export const Choice : t.Type<Choice>
    = t.recursion('Choice', () =>
       t.type ({ choose_between: t.array(Bound)
              , for_choice: ChoiceId }))