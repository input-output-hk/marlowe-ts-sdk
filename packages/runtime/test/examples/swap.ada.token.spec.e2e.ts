

import { pipe } from 'fp-ts/lib/function.js'
import * as TE from 'fp-ts/lib/TaskEither.js'
import { addDays } from 'date-fns/fp'

import { toInput } from '@marlowe.io/language-core-v1/next';
import * as Examples from '@marlowe.io/language-core-v1/examples'
import { datetoTimeout, adaValue } from '@marlowe.io/language-core-v1'
import { mkRestClient } from '@marlowe.io/runtime/restClient';

import { getBankPrivateKey, getBlockfrostContext, getMarloweRuntimeUrl } from '../context.js';
import { provisionAnAdaAndTokenProvider } from '../provisionning.js'
import console from "console"

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
                   , value : tokenValueMinted}
               }))
          , TE.let (`swapContract`, ({swapRequest}) => Examples.SwapADAToken.mkSwapContract(swapRequest))
          , TE.bindW('swapClosedResult',({runtime,adaProvider,tokenProvider,swapRequest,swapContract}) =>
                  pipe( runtime(adaProvider).txCommand.create
                          ( { contract: swapContract
                            , roles: {[swapRequest.provider.roleName] : adaProvider.address
                                     ,[swapRequest.swapper.roleName]  : tokenProvider.address}})
                      , TE.chainW ((contractId) =>
                        runtime(adaProvider).txCommand.applyInputs(contractId)
                            ((next) => ({ inputs : [pipe(next.applicable_inputs.deposits[0],toInput)]})))
                      , TE.chainW ((contractId) =>
                        runtime(tokenProvider).txCommand.applyInputs(contractId)
                              ((next) => ({ inputs : [pipe(next.applicable_inputs.deposits[0],toInput)]})))
                      , TE.chainW ((contractId) =>
                          TE.sequenceArray(
                              [ runtime(adaProvider).txCommand.withdraw    ( { contractId : contractId, role : swapRequest.provider.roleName})
                              , runtime(tokenProvider).txCommand.withdraw  ( { contractId : contractId, role : swapRequest.swapper.roleName })
                              ]))
                      ))
            , TE.match(
              (e) => { console.dir(e, { depth: null }); expect(e).not.toBeDefined()},
              () => { } )) ()

  },1000_000);
});

