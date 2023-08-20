import * as TE from 'fp-ts/lib/TaskEither.js'
import * as T from 'fp-ts/lib/Task.js'
import { pipe } from 'fp-ts/lib/function.js'

import { tokenToString, TokenName } from '@marlowe.io/language-core-v1'
import { mkRuntime } from '@marlowe.io/runtime/overRestClient'
import { RuntimeRestAPI } from '@marlowe.io/runtime/restClient'
import { Context, SingleAddressWallet, PrivateKeysAsHex } from '@marlowe.io/runtime/wallet/nodejs/index.js'

const log = (message:string) => console.log(`\t## - ${message}`);
const formatADA = (lovelaces:bigint): String => new Intl.NumberFormat().format((lovelaces / 1_000_000n)).concat(" ₳");

export type ProvisionScheme =
    { provider   : {adaAmount : bigint}
    , swapper : {adaAmount :bigint,tokenAmount : bigint, tokenName : TokenName}
    }

export const provisionAnAdaAndTokenProvider
    =  (runtimeRestAPI: RuntimeRestAPI) =>
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
                () => log(`  - ${formatADA(bankBalance)}`))))
            , TE.chainFirst(({bankBalance})      => TE.of(expect(bankBalance).toBeGreaterThan(100_000_000)))
            // Provisionning
            , TE.chainFirst(({bank,adaProvider,tokenProvider}) =>
                                bank.provision([[adaProvider,scheme.provider.adaAmount],
                                                [tokenProvider,scheme.swapper.adaAmount]]))
            , TE.bind('tokenValueMinted',({tokenProvider}) => tokenProvider.mintRandomTokens(scheme.swapper.tokenName,scheme.swapper.tokenAmount))
            // Provisionning Checks
            // Ada Provider
            , TE.bind('adaProviderBalance',({adaProvider})     => adaProvider.adaBalance)
            , TE.chainFirst(({adaProvider,adaProviderBalance}) => TE.of(pipe(
                    log( `Ada Provider (${adaProvider.address}`),
                () => log(`   - ${formatADA(adaProviderBalance)}`))))
            // Token Provider
            , TE.bind('tokenProviderADABalance',({tokenProvider})     => tokenProvider.adaBalance)
            , TE.bind('tokenBalance' ,({tokenProvider,tokenValueMinted}) => tokenProvider.tokenBalance(tokenValueMinted.token))
            , TE.chainFirst(({tokenProvider,tokenProviderADABalance,tokenValueMinted,tokenBalance}) => TE.of(pipe(
                    log(`Token Provider (${tokenProvider.address})`),
                () => log(  `   - ${formatADA(tokenProviderADABalance)}`),
                () => log(  `   - ${tokenBalance} ${tokenToString(tokenValueMinted.token)}`))))
            , TE.chainFirst(({tokenBalance}) => TE.of(expect(tokenBalance).toBe(scheme.swapper.tokenAmount)))
            , TE.map (({adaProvider,tokenProvider,tokenValueMinted}) =>
                        ({ adaProvider:adaProvider
                        , tokenProvider:tokenProvider
                        , tokenValueMinted:tokenValueMinted
                        , runtimeRestAPI : runtimeRestAPI
                        , runtime : mkRuntime(runtimeRestAPI)})))


export const initialiseBankAndverifyProvisionning
  =  (runtimeRestAPI: RuntimeRestAPI) =>
     (walletContext: Context) =>
     (bankPrivateKey : PrivateKeysAsHex) =>
       pipe( TE.Do
        , T.bind('bank',() => SingleAddressWallet.Initialise (walletContext,bankPrivateKey))
        , TE.fromTask
        // Check Banks treasury
        , TE.bind('bankBalance',({bank})     => bank.adaBalance)
        , TE.chainFirst(({bankBalance,bank}) => TE.of(pipe(
                    log(`Bank (${bank.address})`),
              () => log(`  - ${formatADA(bankBalance)}`))))
        , TE.chainFirst(({bankBalance})      => TE.of(expect(bankBalance).toBeGreaterThan(100_000_000)))
        , TE.map (({bank}) =>
            ({ bank : bank
             , runtimeRestAPI : runtimeRestAPI
             , runtime : mkRuntime(runtimeRestAPI)(bank)})))