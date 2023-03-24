
import * as ADA from '../../../src/common/ada'

import { SingleAddressWallet} from '../../../src/common/wallet'
import { pipe } from 'fp-ts/function'
import * as Examples from '../../../src/language/core/v1/examples'
import { addDays } from 'date-fns/fp'
import { log } from '../../../src/common/logging'
import * as TE from 'fp-ts/TaskEither'
import * as T from 'fp-ts/Task'
import * as O from 'fp-ts/Option'
import { getBankPrivateKey, getBlockfrostConfiguration, getMarloweRuntimeUrl } from '../../../src/runtime/common/configuration';
import { token } from '../../../src/language/core/v1/semantics/contract/common/token'
import { datetoTimeout } from '../../../src/language/core/v1/semantics/contract/when'
import { applyInputs, initialise } from '../../../src/runtime/write/command'
import { AxiosRestClient } from '../../../src/runtime/endpoints'


describe('swap', () => {
  it('can execute the nominal case', async () => {
    log('#######################')
    log('# Swap : Nominal Case #')
    log('#######################')
    
    log('#########')
    log('# Setup #')
    log('#########')

    const configuration = getBlockfrostConfiguration ();

    const tokenName = "TokenA"  
    const adaAmountforAdaProvider = 20_000_000n
    const adaAmountforTokenProvider = 20_000_000n
    const tokenAmountforTokenProvider = 50n
    const setup 
      = pipe( TE.Do
            // Generating/Initialising Accounts
            , T.bind('bank',()          => SingleAddressWallet.Initialise (configuration,getBankPrivateKey()))
            , T.bind('adaProvider',()   => SingleAddressWallet.Random(configuration))
            , T.bind('tokenProvider',() => SingleAddressWallet.Random(configuration))
            , TE.fromTask
            // Check Banks treasury
            , TE.bind('bankBalance',({bank})     => bank.adaBalance)
            , TE.chainFirst(({bankBalance,bank}) => TE.of(pipe(
                        log(`Bank (${bank.address})`), 
                  () => log(`  - ${ADA.format(bankBalance)}`)))) 
            , TE.chainFirst(({bankBalance})      => TE.of(expect(bankBalance).toBeGreaterThan(100_000_000)))
            // Provisionning
            , TE.chainFirst(({bank,adaProvider,tokenProvider}) =>
                                bank.provision([[adaProvider,adaAmountforAdaProvider],
                                                [tokenProvider,adaAmountforTokenProvider]]))
            , TE.bind('tokenAsset',({tokenProvider}) => tokenProvider.mintRandomTokens(tokenName,tokenAmountforTokenProvider))
            // Provisionning Checks
              // Ada Provider 
            , TE.bind('adaProviderBalance',({adaProvider})     => adaProvider.adaBalance)                                     
            , TE.chainFirst(({adaProvider,adaProviderBalance}) => TE.of(pipe(
                      log( `Ada Provider (${adaProvider.address}`), 
                () => log(`   - ${ADA.format(adaProviderBalance)}`)))) 
              // Token Provider 
            , TE.bind('tokenProviderADABalance',({tokenProvider})     => tokenProvider.adaBalance)                                     
            , TE.bind('tokenProviderMintedTokenBalance' ,({tokenProvider,tokenAsset}) => tokenProvider.assetBalance(tokenAsset))
            , TE.chainFirst(({tokenProvider,tokenProviderADABalance,tokenAsset,tokenProviderMintedTokenBalance}) => TE.of(pipe(
                      log(`Token Provider (${tokenProvider.address})`), 
                () => log(  `   - ${ADA.format(tokenProviderADABalance)}`), 
                () => log(  `   - ${tokenProviderMintedTokenBalance} ${tokenAsset.toString()}`))))
            , TE.chainFirst(({tokenProviderMintedTokenBalance}) => TE.of(expect(tokenProviderMintedTokenBalance).toBe(tokenAmountforTokenProvider)))
            , TE.map (({adaProvider,tokenProvider,tokenAsset}) => 
                          ({ adaProvider:adaProvider
                           , tokenProvider:tokenProvider
                           , tokenAsset:token(tokenAsset.policyId,tokenAsset.tokenName)
                           , initialise : (wallet : SingleAddressWallet ) => 
                                initialise
                                  (AxiosRestClient(getMarloweRuntimeUrl())) 
                                  (wallet.waitConfirmation)
                                  (wallet.signMarloweTx)
                                  ({ changeAddress: wallet.address
                                    , usedAddresses: O.none
                                    , collateralUTxOs: O.none})
                           , applyInputs : (wallet : SingleAddressWallet ) => 
                                applyInputs
                                  (AxiosRestClient(getMarloweRuntimeUrl())) 
                                  (wallet.waitConfirmation)
                                  (wallet.signMarloweTx)
                                  ({ changeAddress: wallet.address
                                    , usedAddresses: O.none
                                    , collateralUTxOs: O.none})
                              })))                        
    await 
      pipe( setup              
            , TE.chainFirst(() => TE.of(log('############')))
            , TE.chainFirst(() => TE.of(log('# Exercise #')))
            , TE.chainFirst(() => TE.of(log('############')))
            , TE.let (`swapRequest`,       ({tokenAsset}) => 
                ({ adaDepositTimeout : pipe(Date.now(),addDays(1),datetoTimeout)
                 , tokenDepositTimeout : pipe(Date.now(),addDays(2),datetoTimeout)
                 , amountOfADA : 2n
                 , amountOfToken : 3n
                 , token :tokenAsset }))
            , TE.let (`swapWithExpectedInputs`, ({swapRequest}) => 
                  Examples.swapWithExpectedInputs(swapRequest))
            , TE.bindW('contractId',({initialise,applyInputs,adaProvider,tokenProvider,swapWithExpectedInputs}) => 
                  pipe( initialise 
                          (adaProvider)
                          ( { contract: swapWithExpectedInputs.swap
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
                              , inputs : [swapWithExpectedInputs.adaProviderInputDeposit]
                              , metadata : {}
                              , tags : {}}))
                      , TE.chainW ((contractDetails) =>       
                           applyInputs
                              (tokenProvider)
                              (contractDetails.contractId)
                              ({ version : "v1"
                                , inputs : [swapWithExpectedInputs.tokenProviderInputDeposit]
                                , metadata : {}
                                , tags : {}})))) 
            , TE.map (({contractId}) => ({contractId}) )
            , TE.match(
              (e) =>  { console.log(e); },
              (res) => { } )) ()

                              
  },1000_000); 
});

