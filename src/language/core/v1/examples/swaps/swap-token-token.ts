/* eslint-disable sort-keys-fix/sort-keys-fix */

import { Contract } from "../../semantics/contract";
import { close } from "../../semantics/contract/close";
import { role } from "../../semantics/contract/common/payee/party";
import { ada, Token } from "../../semantics/contract/common/token";
import { constant, mulValue } from "../../semantics/contract/common/value";
import { Timeout } from "../../semantics/contract/when";


/**
 * Marlowe Example : Swap
 * Description :
 *      Takes Tokens A from one party and tokens B from another party, and it swaps them atomically.
 */

export type SwapRequest 
   = { a : SwapParty
     , b : SwapParty } 

export type SwapParty 
   = { roleName : string
     , depositTimeout : Timeout
     , token:Token
     , amount:bigint} 

export const swap_tokenA_tokenB : ( request: SwapRequest) => Contract 
  = (request) => 
      ({ when :[{ case :{ party: role(request.a.roleName)
                              , deposits: mulValue(constant(1_000_000n), request.a.amount)
                              , of_token: ada
                              , into_account: role(request.a.roleName)  
                              }
                        , then : { when :[{ case :{ party: role(request.b.roleName)
                                                  , deposits: request.b.amount
                                                  , of_token: request.b.token
                                                  , into_account: role(request.b.roleName)
                                                  }
                                          , then : { pay:mulValue(constant(1_000_000n), request.a.amount)
                                                    , token: ada
                                                    , from_account: role(request.a.roleName)  
                                                    , to: {party :  role(request.b.roleName)}
                                                    , then: ({ pay:request.b.amount
                                                            , token: request.b.token
                                                            , from_account: role(request.b.roleName)
                                                            , to: {party : role(request.a.roleName) }
                                                            , then: close})}
                                          }]
                                  , timeout : request.b.depositTimeout
                                  , timeout_continuation : { pay: mulValue(constant(1_000_000n), request.a.amount)
                                                          , token: ada
                                                          , from_account: role(request.a.roleName)  
                                                          , to: {party :  role(request.a.roleName)}
                                                          , then: close}}}]
                , timeout : request.a.depositTimeout
                , timeout_continuation : close})
        

