import * as t from "io-ts";

import { Accounts } from "./contract/common/payee/account";
import { ChoiceId, ValueId } from "./contract/common/value";


export type MarloweState = t.TypeOf<typeof MarloweState>

export const MarloweState = t.type({ accounts:Accounts
                                    , boundValues: t.array(t.tuple([ValueId, t.bigint]))
                                    , choices:     t.array(t.tuple([ChoiceId, t.bigint]))
                                    , minTime:t.bigint})