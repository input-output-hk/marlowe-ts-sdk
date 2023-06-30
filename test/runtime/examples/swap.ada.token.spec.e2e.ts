

import { pipe } from 'fp-ts/function'
import * as Examples from '../../../src/language/core/v1/examples/swaps/swap-token-token'
import { addDays } from 'date-fns/fp'
import * as TE from 'fp-ts/TaskEither'
import { getBankPrivateKey, getBlockfrostContext, getMarloweRuntimeUrl } from '../context';
import { datetoTimeout } from '../../../src/language/core/v1/semantics/contract/when'
import { provisionAnAdaAndTokenProvider } from '../provisionning'
import { mkRuntimeRestAPI } from '../../../src/runtime/restAPI';
import { adaValue } from '../../../src/language/core/v1/semantics/contract/common/token';
import { toInput } from '../../../src/language/core/v1/semantics/next/applicables/canDeposit';


describe('swap', () => {
  it('can execute the nominal case', async () => {

    const provisionScheme = 
      { provider : { adaAmount : 20_000_000n}
      , swapper : { adaAmount :20_000_000n , tokenAmount : 50n, tokenName : "TokenA" }}
  
    await 
      pipe( provisionAnAdaAndTokenProvider 
               (mkRuntimeRestAPI(getMarloweRuntimeUrl()))
               (getBlockfrostContext ())
               (getBankPrivateKey())
               (provisionScheme)
          , TE.let (`swapRequest`, ({tokenValueMinted}) => 
               ({ provider : 
                   { roleName : 'Ada provider'
                   , depositTimeout : pipe(Date.now(),addDays(1),datetoTimeout)
                   , value : adaValue(2n)}
                , swapper : 
                   { roleName : 'Token provider'
                   , depositTimeout : pipe(Date.now(),addDays(2),datetoTimeout)
                   , value : tokenValueMinted}
               }))
          , TE.let (`swapContract`, ({swapRequest}) => Examples.mkSwapContract(swapRequest))
          , TE.bindW('swapClosedResult',({runtime,adaProvider,tokenProvider,swapRequest,swapContract}) => 
                  pipe( runtime(adaProvider).initialise 
                          ( { contract: swapContract
                            , roles: {[swapRequest.provider.roleName] : adaProvider.address 
                                     ,[swapRequest.swapper.roleName]  : tokenProvider.address}})
                      , TE.chainW ((contractId) =>       
                        runtime(adaProvider).applyInputs(contractId)
                            ((next) => ({ inputs : [pipe(next.applicable_inputs.deposits[0],toInput)]})))
                      , TE.chainW ((contractId) =>       
                        runtime(tokenProvider).applyInputs(contractId)
                              ((next) => ({ inputs : [pipe(next.applicable_inputs.deposits[0],toInput)]})))
                      , TE.chainW ((contractId) => 
                          TE.sequenceArray(
                              [ runtime(adaProvider).withdraw    ( { contractId : contractId, role : swapRequest.provider.roleName})
                              , runtime(tokenProvider).withdraw  ( { contractId : contractId, role : swapRequest.swapper.roleName })
                              ]))
                      ))
            , TE.match(
              (e) => { console.dir(e, { depth: null }); expect(e).not.toBeDefined()},
              () => { } )) ()
                              
  },1000_000); 
});

