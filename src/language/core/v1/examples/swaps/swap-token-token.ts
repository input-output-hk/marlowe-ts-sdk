/* eslint-disable sort-keys-fix/sort-keys-fix */

import { Contract } from "../../semantics/contract";
import { close } from "../../semantics/contract/close";
import { role } from "../../semantics/contract/common/payee/party";
import { Token, TokenValue } from "../../semantics/contract/common/token";
import { constant, mulValue } from "../../semantics/contract/common/value";
import { Timeout } from "../../semantics/contract/when";


/**
 * Marlowe Example : Swap
 * Description :
 *      Takes Tokens A from one party and tokens B from another party, and it swaps them atomically.
 */

export type SwapRequest 
   = { provider : SwapParty
     , swapper : SwapParty } 

export type SwapParty 
   = { roleName : string
     , depositTimeout : Timeout
     , value: TokenValue
     } 

export const mkSwapContract : ( request: SwapRequest) => Contract 
  = (request) => 
      ({ when :[{ case :{ party: role(request.provider.roleName)
                              , deposits:  request.provider.value.amount
                              , of_token: request.provider.value.token
                              , into_account: role(request.provider.roleName)  
                              }
                        , then : { when :[{ case :{ party: role(request.swapper.roleName)
                                                  , deposits: request.swapper.value.amount
                                                  , of_token: request.swapper.value.token
                                                  , into_account: role(request.swapper.roleName)
                                                  }
                                          , then : { pay:request.provider.value.amount
                                                    , token: request.provider.value.token
                                                    , from_account: role(request.provider.roleName)  
                                                    , to: {party :  role(request.swapper.roleName)}
                                                    , then: ({ pay:request.swapper.value.amount
                                                            , token: request.swapper.value.token
                                                            , from_account: role(request.swapper.roleName)
                                                            , to: {party : role(request.provider.roleName) }
                                                            , then: close})}
                                          }]
                                  , timeout : request.swapper.depositTimeout
                                  , timeout_continuation : { pay:  request.provider.value.amount
                                                          , token: request.provider.value.token
                                                          , from_account: role(request.provider.roleName)  
                                                          , to: {party :  role(request.provider.roleName)}
                                                          , then: close}}}]
                , timeout : request.provider.depositTimeout
                , timeout_continuation : close})
        

