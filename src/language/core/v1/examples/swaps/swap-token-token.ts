/* eslint-disable sort-keys-fix/sort-keys-fix */

import { Contract } from "../../semantics/contract";
import { close } from "../../semantics/contract/close";
import { Party, Role, role } from "../../semantics/contract/common/payee/party";
import { ada, Token } from "../../semantics/contract/common/token";
import { Value, constant, mulValue } from "../../semantics/contract/common/value";
import { Timeout } from "../../semantics/contract/when";
import { InputDeposit } from "../../semantics/contract/when/input/deposit";


/**
 * Marlowe Example : Swap
 * Description :
 *      Takes Tokens A from one party and tokens B from another party, and it swaps them atomically.
 */

export type SwapRequest 
   = { tokenA_DepositTimeout : Timeout
     , tokenB_DepositTimeout:Timeout
     , tokenA:Token
     , tokenA_Amount:bigint
     , tokenB:Token
     , tokenB_Amount:bigint } 

export const swap_tokenA_tokenB : ( request: SwapRequest) => Contract 
  = (request) => 
      ({ when :[{ case :{ party: getTokenRoleName(request.tokenA)  
                              , deposits: mulValue(constant(1_000_000n), request.tokenA_Amount)
                              , of_token: ada
                              , into_account: getTokenRoleName(request.tokenA)  
                              }
                        , then : { when :[{ case :{ party: getTokenRoleName(request.tokenB)
                                                  , deposits: request.tokenB_Amount
                                                  , of_token: request.tokenB
                                                  , into_account: role('Token provider') 
                                                  }
                                          , then : { pay:mulValue(constant(1_000_000n), request.tokenA_Amount)
                                                    , token: ada
                                                    , from_account: getTokenRoleName(request.tokenA)  
                                                    , to: {party : getTokenRoleName(request.tokenB)}
                                                    , then: ({ pay:request.tokenB_Amount
                                                            , token: request.tokenB
                                                            , from_account: getTokenRoleName(request.tokenB)
                                                            , to: {party : getTokenRoleName(request.tokenA) }
                                                            , then: close})}
                                          }]
                                  , timeout : request.tokenB_DepositTimeout
                                  , timeout_continuation : { pay: mulValue(constant(1_000_000n), request.tokenA_Amount)
                                                          , token: ada
                                                          , from_account: getTokenRoleName(request.tokenA)  
                                                          , to: {party :getTokenRoleName(request.tokenA) }
                                                          , then: close}}}]
                , timeout : request.tokenA_DepositTimeout
                , timeout_continuation : close})
        
const getTokenRoleName : (token:Token) => Role = (token) => role(token.token_name + ' Provider')
