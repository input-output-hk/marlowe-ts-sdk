

import { pipe } from 'fp-ts/lib/function.js'
import * as TE from 'fp-ts/lib/TaskEither.js'
import { addDays } from 'date-fns/fp'

import { toInput } from '@marlowe.io/language-core-v1/next';
import * as Examples from '@marlowe.io/language-core-v1/examples'
import { datetoTimeout, adaValue } from '@marlowe.io/language-core-v1'
import { mkRestClient } from '@marlowe.io/runtime-rest-client/index.js';
import { getBankPrivateKey, getBlockfrostContext, getMarloweRuntimeUrl } from '../context.js';
import { provisionAnAdaAndTokenProvider } from '../provisionning.js'
import console from "console"
import { runtimeTokenToMarloweTokenValue } from '@marlowe.io/runtime-core';
import { onlyByContractIds } from '@marlowe.io/runtime-lifecycle/api';

global.console = console

describe('swap', () => {
  it('can execute the nominal case', async () => {
    const provisionScheme =
      { provider : { adaAmount : 20_000_000n}
      , swapper : { adaAmount :20_000_000n , tokenAmount : 50n, tokenName : "TokenA" }}

    await
      pipe( provisionAnAdaAndTokenProvider
               (mkRestClient(getMarloweRuntimeUrl()))
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
                   , value : runtimeTokenToMarloweTokenValue(tokenValueMinted)}
               }))
          , TE.let (`swapContract`, ({swapRequest}) => Examples.SwapADAToken.mkSwapContract(swapRequest))
          , TE.bindW('swapClosedResult',({runtime,adaProvider,tokenProvider,swapRequest,swapContract}) =>
                  pipe( runtime(adaProvider).contracts.create
                          ( { contract: swapContract
                            , roles: {[swapRequest.provider.roleName] : adaProvider.address
                                     ,[swapRequest.swapper.roleName]  : tokenProvider.address}})
                      , TE.chainW ((contractId) =>
                        runtime(adaProvider).contracts.applyInputs(contractId)
                            ((next) => ({ inputs : [pipe(next.applicable_inputs.deposits[0],toInput)]})))
                      , TE.chainW ((contractId) =>
                        runtime(tokenProvider).contracts.applyInputs(contractId)
                              ((next) => ({ inputs : [pipe(next.applicable_inputs.deposits[0],toInput)]})))
                      , TE.chainW ((contractId) =>
                            TE.sequenceArray(
                              [ pipe
                                ( runtime(adaProvider).payouts.available  (onlyByContractIds([contractId]))
                                , TE.map (payoutsAvalaible => { expect(payoutsAvalaible.length).toBe(1);return payoutsAvalaible.map(payout => payout.payoutId)})
                                , TE.chain (payoutIds => runtime(adaProvider).payouts.withdraw(payoutIds))
                                , TE.chain ( _ => runtime(adaProvider).payouts.withdrawn  (onlyByContractIds([contractId])))
                                , TE.map (payoutsWthdrawn => expect(payoutsWthdrawn.length).toBe(1)))
                              , pipe
                                ( runtime(tokenProvider).payouts.available  (onlyByContractIds([contractId]))
                                , TE.map (payoutsAvalaible => { expect(payoutsAvalaible.length).toBe(1);return payoutsAvalaible.map(payout => payout.payoutId)})
                                , TE.chain (payoutIds => runtime(tokenProvider).payouts.withdraw (payoutIds))
                                , TE.chain ( _ => runtime(adaProvider).payouts.withdrawn  (onlyByContractIds([contractId])))
                                , TE.map (payoutsWthdrawn => expect(payoutsWthdrawn.length).toBe(1))
                                ) 
                              ]))
                      ))
            , TE.match(
              (e) => { console.dir(e, { depth: null }); expect(e).not.toBeDefined()},
              () => { } )) ()

  },1_000_000);
});

