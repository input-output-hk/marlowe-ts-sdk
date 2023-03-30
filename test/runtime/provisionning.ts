import * as TE from 'fp-ts/TaskEither'
import * as T from 'fp-ts/Task'
import * as O from 'fp-ts/Option'
import { pipe } from 'fp-ts/function'
import { Context, SingleAddressWallet } from '../../src/adapter/wallet/lucid'
import {PrivateKeysAsHex} from '../../src/adapter/wallet/privateKeys'
import { log } from '../../src/adapter/logging'
import * as ADA from '../../src/adapter/wallet/ada'
import { token, TokenName } from '../../src/language/core/v1/semantics/contract/common/token'
import { AxiosRestClient } from '../../src/runtime/endpoints'
import { applyInputs, initialise, withdraw } from '../../src/runtime/write/command'

export type ProvisionScheme = 
    { adaProvider   : {adaAmount : bigint}
    , tokenprovider : {adaAmount :bigint,tokenAmount : bigint, tokenName : TokenName}
    }

export const provisionAnAdaAndTokenProvider 
    =  (runtimeURL: string) =>
       (walletContext: Context) => 
       (bankPrivateKey : PrivateKeysAsHex) => 
       (scheme : ProvisionScheme) => 
            pipe( TE.Do
            // Generating/Initialising Accounts
            , T.bind('bank',()          => SingleAddressWallet.Initialise (walletContext,bankPrivateKey))
            , T.bind('adaProvider',()   => SingleAddressWallet.Random(walletContext))
            , T.bind('tokenProvider',() => SingleAddressWallet.Random(walletContext))
            , TE.fromTask
            // Check Banks treasury
            , TE.bind('bankBalance',({bank})     => bank.adaBalance)
            , TE.chainFirst(({bankBalance,bank}) => TE.of(pipe(
                        log(`Bank (${bank.address})`), 
                () => log(`  - ${ADA.format(bankBalance)}`)))) 
            , TE.chainFirst(({bankBalance})      => TE.of(expect(bankBalance).toBeGreaterThan(100_000_000)))
            // Provisionning
            , TE.chainFirst(({bank,adaProvider,tokenProvider}) =>
                                bank.provision([[adaProvider,scheme.adaProvider.adaAmount],
                                                [tokenProvider,scheme.tokenprovider.adaAmount]]))
            , TE.bind('tokenAsset',({tokenProvider}) => tokenProvider.mintRandomTokens(scheme.tokenprovider.tokenName,scheme.tokenprovider.tokenAmount))
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
            , TE.chainFirst(({tokenProviderMintedTokenBalance}) => TE.of(expect(tokenProviderMintedTokenBalance).toBe(scheme.tokenprovider.tokenAmount)))
            , TE.map (({adaProvider,tokenProvider,tokenAsset}) => 
                        ({ adaProvider:adaProvider
                        , tokenProvider:tokenProvider
                        , tokenAsset:token(tokenAsset.policyId,tokenAsset.tokenName)
                        , initialise : (wallet : SingleAddressWallet ) => 
                                initialise
                                (AxiosRestClient(runtimeURL)) 
                                (wallet.waitConfirmation)
                                (wallet.signMarloweTx)
                                ({ changeAddress: wallet.address
                                    , usedAddresses: O.none
                                    , collateralUTxOs: O.none})
                        , applyInputs : (wallet : SingleAddressWallet ) => 
                                applyInputs
                                    (AxiosRestClient(runtimeURL)) 
                                    (wallet.waitConfirmation)
                                    (wallet.signMarloweTx)
                                    ({ changeAddress: wallet.address
                                        , usedAddresses: O.none
                                        , collateralUTxOs: O.none})
                        , withdraw : (wallet : SingleAddressWallet ) => 
                                withdraw
                                    (AxiosRestClient(runtimeURL)) 
                                    (wallet.waitConfirmation)
                                    (wallet.signMarloweTx)
                                    ({ changeAddress: wallet.address
                                    , usedAddresses: O.none
                                    , collateralUTxOs: O.none})    })))                  
                            

export const initialiseBankAndverifyProvisionning 
  =  (runtimeURL: string) =>
     (walletContext: Context) => 
     (bankPrivateKey : PrivateKeysAsHex) => 
       pipe( TE.Do
        , T.bind('bank',() => SingleAddressWallet.Initialise (walletContext,bankPrivateKey))
        , TE.fromTask
        // Check Banks treasury
        , TE.bind('bankBalance',({bank})     => bank.adaBalance)
        , TE.chainFirst(({bankBalance,bank}) => TE.of(pipe(
                    log(`Bank (${bank.address})`), 
              () => log(`  - ${ADA.format(bankBalance)}`)))) 
        , TE.chainFirst(({bankBalance})      => TE.of(expect(bankBalance).toBeGreaterThan(100_000_000)))
        , TE.map (({bank}) => 
            ({ bank : bank
             , restApi : AxiosRestClient(runtimeURL)
             , initialise:initialise
                           (AxiosRestClient(runtimeURL)) 
                           (bank.waitConfirmation)
                           (bank.signMarloweTx)
                           ({ changeAddress: bank.address
                             , usedAddresses: O.none
                             , collateralUTxOs: O.none})
             , applyInputs :applyInputs 
                             (AxiosRestClient(runtimeURL)) 
                             (bank.waitConfirmation)
                             (bank.signMarloweTx)
                             ({ changeAddress: bank.address
                               , usedAddresses: O.none
                               , collateralUTxOs: O.none})})))  