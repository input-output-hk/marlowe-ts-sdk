import { pipe } from 'fp-ts/function'
import * as Examples from '../../../src/language/core/v1/examples/swaps/swap-token-token'
import { addDays } from 'date-fns/fp'
import * as TE from 'fp-ts/TaskEither'
import * as O from 'fp-ts/Option'
import { getBankPrivateKey, getBlockfrostContext, getMarloweRuntimeUrl } from '../context';
import { datetoTimeout } from '../../../src/language/core/v1/semantics/contract/when'
import { mkRuntimeRestAPI } from '../../../src/runtime/restAPI'
import { provisionAnAdaAndTokenProvider } from '../provisionning'
import { adaValue } from '../../../src/language/core/v1/semantics/contract/common/token'
import { toInput } from '../../../src/language/core/v1/semantics/next/applicables/canDeposit'


describe('withdrawals endpoints ', () => {

  const runtimeRestAPI = mkRuntimeRestAPI(getMarloweRuntimeUrl())
  const provisionScheme = 
    { provider : { adaAmount : 20_000_000n}
    , swapper : { adaAmount :20_000_000n , tokenAmount : 50n, tokenName : "TokenA" }}
  
  const executeSwapWithRequiredWithdrawalTillClosing 
    = pipe( provisionAnAdaAndTokenProvider 
              (runtimeRestAPI)
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
          , TE.bindW('contractId',({runtime,adaProvider,tokenProvider,swapRequest,swapContract}) => 
              pipe( runtime(adaProvider).initialise 
                      ( { contract: swapContract
                        , roles: {[swapRequest.provider.roleName] : adaProvider.address 
                                 ,[swapRequest.swapper.roleName]  : tokenProvider.address}})
                  , TE.chainW ((contractId) =>       
                    runtime(adaProvider).applyInputs
                        (contractId)
                        ((next) => ({ inputs : [pipe(next.applicable_inputs.deposits[0],toInput)]})))
                  , TE.chainW (contractId =>       
                    runtime(tokenProvider).applyInputs
                          (contractId)
                          ((next) => ({ inputs : [pipe(next.applicable_inputs.deposits[0],toInput)]}))))))
                              

  it('can build a withdraw Tx : ' +
     '(can POST : /withdrawals => ask to build the Tx to withdraw assets on the closed contract )' , async () => {
            
    await 
      pipe( executeSwapWithRequiredWithdrawalTillClosing              
            , TE.bindW('result',({adaProvider,contractId,swapRequest}) => 
                  pipe( runtimeRestAPI.withdrawals.post 
                          ( { contractId : contractId
                            , role : swapRequest.provider.roleName }
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
          , TE.bindW('result',({adaProvider,tokenProvider,contractId,swapRequest,runtime}) => 
              TE.sequenceArray(
                [ runtime(adaProvider).withdraw    ( { contractId : contractId, role : swapRequest.provider.roleName})
                , runtime(tokenProvider).withdraw  ( { contractId : contractId, role : swapRequest.swapper.roleName })
                ])) 
          , TE.match(
              (e) => { console.dir(e, { depth: null }); expect(e).not.toBeDefined()},
              () => {} )) ()

                              
  },1000_000); 
});

