import * as t from "io-ts";

import { Accounts } from "../../language/core/v1/semantics/contract/common/payee/account";

export type MarloweState = t.TypeOf<typeof MarloweState>
export const MarloweState = t.type({ accounts:Accounts
                                   , boundValues: t.array(t.bigint)
                                   , choices:t.array(t.bigint)
                                   , minTime:t.bigint})