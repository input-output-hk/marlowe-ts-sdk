/* eslint-disable sort-keys-fix/sort-keys-fix */

import { Contract } from "../semantics/contract";
import { close } from "../semantics/contract/close";
import { Party, role } from "../semantics/contract/common/payee/party";
import { ada, Token } from "../semantics/contract/common/token";
import { Value, constant, mulValue } from "../semantics/contract/common/value";
import { Timeout } from "../semantics/contract/when";
import { InputDeposit } from "../semantics/contract/when/input/deposit";


/**
 * Marlowe Example : Swap
 * Description :
 *      Takes Ada from one party and dollar tokens from another party, and it swaps them atomically.
 */

export const swap : ( adaDepositTimeout:Timeout
                    , tokenDepositTimeout:Timeout
                    , amountOfADA:bigint
                    , amountOfToken:bigint
                    , token:Token) => Contract 
  = (adaDepositTimeout, tokenDepositTimeout,amountOfADA,amountOfToken,token) => 
      ({ when :[{ case :{ party: role('Ada provider')  
                              , deposits: mulValue(constant(1_000_000n), amountOfADA)
                              , of_token: ada
                              , into_account: role('Ada provider')  
                              }
                        , then : { when :[{ case :{ party: role('Token provider')
                                                  , deposits: amountOfToken
                                                  , of_token: token
                                                  , into_account: role('Token provider') 
                                                  }
                                          , then : { pay:mulValue(constant(1_000_000n), amountOfADA)
                                                    , token: ada
                                                    , from_account: role('Ada provider')  
                                                    , to: {party : role('Token provider')}
                                                    , then: ({ pay:amountOfToken
                                                            , token: token
                                                            , from_account: role('Token provider')
                                                            , to: {party : role('Ada provider') }
                                                            , then: close})}
                                          }]
                                  , timeout : tokenDepositTimeout
                                  , timeout_continuation : { pay: mulValue(constant(1_000_000n), amountOfADA)
                                                          , token: ada
                                                          , from_account: role('Ada provider')  
                                                          , to: {party :role('Ada provider') }
                                                          , then: close}}}]
                , timeout : adaDepositTimeout
                , timeout_continuation : close})
        

export type SwapWithExpectedInputs = 
        { swap : Contract
        , adaProviderInputDeposit : InputDeposit
        , tokenProviderInputDeposit : InputDeposit} 

export type SwapRequest 
   = { adaDepositTimeout:Timeout
     , tokenDepositTimeout:Timeout
     , amountOfADA:bigint
     , amountOfToken:bigint
     , token:Token }   

export const swapWithExpectedInputs 
        : (request :SwapRequest )=> SwapWithExpectedInputs
   = (request) =>
        ({ swap : swap(request.adaDepositTimeout, request.tokenDepositTimeout,request.amountOfADA,request.amountOfToken,request.token)
        , adaProviderInputDeposit : { input_from_party: role ('Ada provider')
                                    , that_deposits: 1_000_000n * request.amountOfADA
                                    , of_token: ada
                                    , into_account: role('Ada provider') }
        , tokenProviderInputDeposit : { input_from_party: role('Token provider')
                                        , that_deposits: request.amountOfToken
                                        , of_token: request.token
                                        , into_account: role('Token provider') }
        })


// Slightly different version of where the providers need to withdraw themselves the token at the end.
export const swapWithRequiredWithdrawal : ( adaDepositTimeout:Timeout
        , tokenDepositTimeout:Timeout
        , amountOfADA:bigint
        , amountOfToken:bigint
        , token:Token) => Contract 
      = (adaDepositTimeout, tokenDepositTimeout,amountOfADA,amountOfToken,token) => 
          ({ when :[{ case :{ party: role('Ada provider')  
                                  , deposits: mulValue(constant(1_000_000n), amountOfADA)
                                  , of_token: ada
                                  , into_account: role('Ada provider')  
                                  }
                            , then : { when :[{ case :{ party: role('Token provider')
                                                      , deposits: amountOfToken
                                                      , of_token: token
                                                      , into_account: role('Token provider') 
                                                      }
                                              , then : close 
                                              }]
                                      , timeout : tokenDepositTimeout
                                      , timeout_continuation : close}}]
                    , timeout : adaDepositTimeout
                    , timeout_continuation : close})

export const swapWithRequiredWithdrawalAndExpectedInputs 
                : (request :SwapRequest )=> SwapWithExpectedInputs
        = (request) =>
                ({ swap : swapWithRequiredWithdrawal(request.adaDepositTimeout, request.tokenDepositTimeout,request.amountOfADA,request.amountOfToken,request.token)
                , adaProviderInputDeposit : { input_from_party: role ('Ada provider')
                                        , that_deposits: 1_000_000n * request.amountOfADA
                                        , of_token: ada
                                        , into_account: role('Ada provider') }
                , tokenProviderInputDeposit : { input_from_party: role('Token provider')
                                                , that_deposits: request.amountOfToken
                                                , of_token: request.token
                                                , into_account: role('Token provider') }
                })   
