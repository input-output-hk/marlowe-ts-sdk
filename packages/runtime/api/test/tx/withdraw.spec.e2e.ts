import { pipe } from 'fp-ts/lib/function.js';
import * as TE from 'fp-ts/lib/TaskEither.js';
import * as O from 'fp-ts/lib/Option.js';
import { addDays } from 'date-fns/fp';

import * as Examples from '@marlowe.io/language-core-v1/examples';
import { datetoTimeout, adaValue } from '@marlowe.io/language-core-v1';
import { toInput } from '@marlowe.io/language-core-v1/next';
import { mkRestClient } from '@marlowe.io/runtime-rest-client/index.js';

import { getBankPrivateKey, getBlockfrostContext, getMarloweRuntimeUrl } from '../context.js';
import { provisionAnAdaAndTokenProvider } from '../provisionning.js';
import console from "console"

global.console = console

describe('Marlowe Tx Commands', () => {

  const restAPI = mkRestClient(getMarloweRuntimeUrl())
  const provisionScheme =
    { provider : { adaAmount : 20_000_000n}
    , swapper : { adaAmount :20_000_000n , tokenAmount : 50n, tokenName : "TokenA" }}

  const executeSwapWithRequiredWithdrawalTillClosing
    = pipe( provisionAnAdaAndTokenProvider
              (restAPI)
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
          , TE.let (`swapContract`, ({swapRequest}) => Examples.SwapADAToken.mkSwapContract(swapRequest))
          , TE.bindW('contractId',({runtime,adaProvider,tokenProvider,swapRequest,swapContract}) =>
              pipe( runtime(adaProvider).txCommand.create
                      ( { contract: swapContract
                        , roles: {[swapRequest.provider.roleName] : adaProvider.address
                                 ,[swapRequest.swapper.roleName]  : tokenProvider.address}})
                  , TE.chainW ((contractId) =>
                    runtime(adaProvider).txCommand.applyInputs
                        (contractId)
                        ((next) => ({ inputs : [pipe(next.applicable_inputs.deposits[0],toInput)]})))
                  , TE.chainW (contractId =>
                    runtime(tokenProvider).txCommand.applyInputs
                          (contractId)
                          ((next) => ({ inputs : [pipe(next.applicable_inputs.deposits[0],toInput)]})))))
          , TE.bindW(`payouts`,({contractId}) => 
              pipe (restAPI.payouts.getHeadersByRange 
                      (O.none) 
                      ([contractId]) 
                      ([])
                    , TE.map((result) => result.headers))
           ))

  it('can withdraw' , async () => {

    await
      pipe( executeSwapWithRequiredWithdrawalTillClosing
          , TE.bindW('result',({adaProvider,tokenProvider,payouts,swapRequest,runtime}) =>
              TE.sequenceArray(
                [ runtime(adaProvider).txCommand.withdraw
                    ( { payouts : payouts
                          .filter(payout => payout.role.assetName === swapRequest.provider.roleName)
                          .map (payout => payout.payoutId)})
                , runtime(tokenProvider).txCommand.withdraw  
                    ( { payouts : payouts
                      .filter(payout => payout.role.assetName === swapRequest.swapper.roleName)
                      .map (payout => payout.payoutId)})
                ]))
          , TE.match(
              (e) => { console.dir(e, { depth: null }); expect(e).not.toBeDefined()},
              () => {} )) ()


  },1000_000);
});

