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

describe('withdrawals endpoints ', () => {

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
                          ((next) => ({ inputs : [pipe(next.applicable_inputs.deposits[0],toInput)]}))))))


  it('can build a withdraw Tx : ' +
     '(can POST : /withdrawals => ask to build the Tx to withdraw assets on the closed contract )' , async () => {

    await
      pipe( executeSwapWithRequiredWithdrawalTillClosing
            , TE.bindW('result',({adaProvider,contractId,swapRequest}) =>
                  pipe( restAPI.withdrawals.post
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
                [ runtime(adaProvider).txCommand.withdraw    ( { contractId : contractId, role : swapRequest.provider.roleName})
                , runtime(tokenProvider).txCommand.withdraw  ( { contractId : contractId, role : swapRequest.swapper.roleName })
                ]))
          , TE.match(
              (e) => { console.dir(e, { depth: null }); expect(e).not.toBeDefined()},
              () => {} )) ()


  },1000_000);
});

