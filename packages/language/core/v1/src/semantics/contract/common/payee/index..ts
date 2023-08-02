import * as t from "io-ts";
import { AccountId } from "./account";
import { Party } from "./party";


export type Payee = t.TypeOf<typeof Payee>
export const Payee = t.union([ t.type({ account: AccountId }) 
                             , t.type({ party: Party }) 
                             ])