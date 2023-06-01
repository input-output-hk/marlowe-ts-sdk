import * as t from "io-ts";

import { Accounts } from "../../language/core/v1/semantics/contract/common/payee/account";
import { ChoiceId, ValueId } from "../../language/core/v1/semantics/contract/common/value";


export type MarloweState = t.TypeOf<typeof MarloweState>

export const MarloweState = t.type({ accounts:Accounts
                                    , boundValues: t.array(t.tuple([ValueId, t.bigint]))
                                    , choices:     t.array(t.tuple([ChoiceId, t.bigint]))
                                    , minTime:t.bigint})