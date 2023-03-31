

import { pipe } from 'fp-ts/function'
import * as Examples from '../../../src/language/core/v1/examples'
import { addDays } from 'date-fns/fp'
import * as TE from 'fp-ts/TaskEither'
import * as O from 'fp-ts/Option'
import { getBankPrivateKey, getBlockfrostContext, getMarloweRuntimeUrl } from '../context';
import { datetoTimeout } from '../../../src/language/core/v1/semantics/contract/when'
import { AxiosRestClient } from '../../../src/runtime/endpoints'
import { provisionAnAdaAndTokenProvider } from '../provisionning'

describe('withdrawals endpoints ', () => {

  const restApi = AxiosRestClient(getMarloweRuntimeUrl())
  const provisionScheme = 
  { adaProvider : { adaAmount : 20_000_000n}
  , tokenprovider : { adaAmount :20_000_000n 
                    , tokenAmount : 50n
                    , tokenName : "TokenA" }}
  const executeSwapWithRequiredWithdrawalTillClosing 
    = pipe( provisionAnAdaAndTokenProvider 
              (getMarloweRuntimeUrl())
              (getBlockfrostContext ())
              (getBankPrivateKey())
              (provisionScheme)
          , TE.let (`swapRequest`,       ({tokenAsset}) => 
              ({ adaDepositTimeout   : pipe(Date.now(),addDays(1),datetoTimeout)
              , tokenDepositTimeout : pipe(Date.now(),addDays(2),datetoTimeout)
              , amountOfADA   : 2n
              , amountOfToken : 3n
              , token :tokenAsset }))
          , TE.let (`swapWithRequiredWithdrawalAndExpectedInputs`, ({swapRequest}) => 
              Examples.swapWithRequiredWithdrawalAndExpectedInputs(swapRequest))
          , TE.bindW('contractDetails',({initialise,applyInputs,adaProvider,tokenProvider,swapWithRequiredWithdrawalAndExpectedInputs}) => 
              pipe( initialise 
                      (adaProvider)
                      ( { contract: swapWithRequiredWithdrawalAndExpectedInputs.swap
                        , roles: {'Ada provider'   : adaProvider.address 
                                 ,'Token provider' : tokenProvider.address}
                        , version: 'v1'
                        , metadata: {}
                        , tags : {}
                        , minUTxODeposit: 3_000_000})
                  , TE.chainW ((contractDetails) =>       
                      applyInputs
                        (adaProvider)
                        (contractDetails.contractId)
                        ({ version : "v1"
                          , inputs : [swapWithRequiredWithdrawalAndExpectedInputs.adaProviderInputDeposit]
                          , metadata : {}
                          , tags : {}}))
                  , TE.chainW (contractDetails =>       
                      applyInputs
                          (tokenProvider)
                          (contractDetails.contractId)
                          ({ version : "v1"
                            , inputs : [swapWithRequiredWithdrawalAndExpectedInputs.tokenProviderInputDeposit]
                            , metadata : {}
                            , tags : {}})
                            ))) )  

  it('can build a withdraw Tx : ' +
     '(can POST : /withdrawals => ask to build the Tx to withdraw assets on the closed contract )' , async () => {
            
    await 
      pipe( executeSwapWithRequiredWithdrawalTillClosing              
            , TE.bindW('result',({adaProvider,contractDetails}) => 
                  pipe( restApi.withdrawals.post 
                          ( { contractId : contractDetails.contractId
                            , role : 'Ada provider' }
                          , { changeAddress: adaProvider.address
                            , usedAddresses: O.none
                            , collateralUTxOs: O.none})
                      )) 
            , TE.match(
              (e) => { console.dir(e, { depth: null }); expect(e).not.toBeDefined()},
              () => { } )) ()

                              
  },1000_000); 

  it('can withdraw : ' +
     '(can POST : /withdrawals => ask to build the Tx to withdraw assets on the closed contract )' + 
     ' and PUT  : /withdrawals/{withdrawalId} => Append the withdraw Tx to the ledger' + 
     ' and GET  : /withdrawals/{withdrawalId} => retrieve the Tx state', async () => {
            
    await 
      pipe( executeSwapWithRequiredWithdrawalTillClosing              
          , TE.bindW('result',({adaProvider,tokenProvider,contractDetails,withdraw}) => 
                      pipe 
                        ( withdraw 
                            (adaProvider)
                            ( { contractId : contractDetails.contractId
                              , role : 'Ada provider' })
                        , TE.chain (() => 
                          withdraw 
                            (tokenProvider)
                            ( { contractId : contractDetails.contractId
                              , role : 'Token provider' })) )) 
            , TE.match(
              (e) => { console.dir(e, { depth: null }); expect(e).not.toBeDefined()},
              () => {} )) ()

                              
  },1000_000); 
});

