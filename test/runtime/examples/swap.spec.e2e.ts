
import * as ADA from '../../../src/common/ada'

import { SingleAddressWallet} from '../../../src/common/wallet'
import { pipe } from 'fp-ts/function'
import * as Examples from '../../../src/language/core/v1/examples'
import { addDays } from 'date-fns/fp'
import { MarloweStateMachine } from '../../../src/runtime/stateMachine'
import { log } from '../../../src/common/logging'
import * as TE from 'fp-ts/TaskEither'
import * as T from 'fp-ts/Task'
import * as O from 'fp-ts/Option'
import { getBankPrivateKey, getBlockfrostConfiguration, getMarloweRuntimeUrl } from '../../../src/runtime/common/configuration';
import { token } from '../../../src/language/core/v1/semantics/contract/common/token'
import { MarloweJSONCodec } from '../../../src/common/json'
import { datetoTimeout } from '../../../src/language/core/v1/semantics/contract/when'


describe.skip('swap', () => {
  it('can execute the nominal case', async () => {
    log('#######################')
    log('# Swap : Nominal Case #')
    log('#######################')
    
    log('#########')
    log('# Setup #')
    log('#########')

    const configuration = getBlockfrostConfiguration ();

    const tokenName = "TokenA"  
    const adaAmountforAdaProvider = 10_000_000n
    const adaAmountforTokenProvider = 10_000_000n
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
                          ({adaProvider:adaProvider
                          ,tokenProvider:tokenProvider
                          ,tokenAsset:token(tokenAsset.policyId,tokenAsset.tokenName)})))                        
    const exercise 
      = pipe( setup              
            , TE.chainFirst(() => TE.of(log('############')))
            , TE.chainFirst(() => TE.of(log('# Exercise #')))
            , TE.chainFirst(() => TE.of(log('############')))
            , TE.let (`adaDepositTimeout`,   () => pipe(Date.now(),addDays(1),datetoTimeout))
            , TE.let (`tokenDepositTimeout`, () => pipe(Date.now(),addDays(2),datetoTimeout))
            , TE.let (`amountOfADA`,         () => 2n)
            , TE.let (`amountOfToken`,       () => 3n)
            , TE.let (`marloweStateMachine`,      () => new MarloweStateMachine(getMarloweRuntimeUrl()))
            , TE.let (`swap`, ({adaDepositTimeout,tokenDepositTimeout,amountOfADA,amountOfToken,tokenAsset}) => 
                  Examples.swap(adaDepositTimeout,tokenDepositTimeout,amountOfADA,amountOfToken,tokenAsset))
            , TE.bind('contractId',({marloweStateMachine,adaProvider,tokenProvider,swap}) => 
                  marloweStateMachine.initialise
                      ( swap
                      , adaProvider.signMarloweTx 
                      , { changeAddress : adaProvider.address
                        , usedAddresses : O.none
                        , collateralUTxOs : O.none}
                      , {'Ada provider'   : adaProvider.address 
                        ,'Token provider' : tokenProvider.address})) 
            , TE.map (({contractId}) => ({contractId}) )
            )

    const main 
      = await pipe( exercise 
            , TE.match(
              (e) =>  { console.log(e); },
             (res) => { console.log(MarloweJSONCodec.encode(res)); }
            ))();

                              
  },1000_000); 
});

