
import * as ADA from '../../../src/common/ada'
import { SingleAddressWallet} from '../../../src/common/wallet'
import { pipe } from 'fp-ts/function'
import { close } from '../../../src/language/core/v1/semantics/contract/close'
import { log } from '../../../src/common/logging'
import * as TE from 'fp-ts/TaskEither'
import * as T from 'fp-ts/Task'
import { getBankPrivateKey, getBlockfrostConfiguration, getMarloweRuntimeUrl } from '../../../src/runtime/common/configuration';
import { AxiosRestClient, Initialise } from '../../../src/runtime/endpoints';
import '@relmify/jest-fp-ts'
import * as O from 'fp-ts/lib/Option';

describe.skip('contracts endpoints', () => {

  const restApi = AxiosRestClient(getMarloweRuntimeUrl())
  const setup 
    = pipe( TE.Do
          , TE.chainFirst(() => TE.of(log('############')))
          , TE.chainFirst(() => TE.of(log('# Setup #')))
          , TE.chainFirst(() => TE.of(log('############')))
          , T.bind('bank',() => SingleAddressWallet.Initialise (getBlockfrostConfiguration (),getBankPrivateKey()))
          , TE.fromTask
          // Check Banks treasury
          , TE.bind('bankBalance',({bank})     => bank.adaBalance)
          , TE.chainFirst(({bankBalance,bank}) => TE.of(pipe(
                      log(`Bank (${bank.address})`), 
                () => log(`  - ${ADA.format(bankBalance)}`)))) 
          , TE.chainFirst(({bankBalance})      => TE.of(expect(bankBalance).toBeGreaterThan(100_000_000)))
          , TE.map (({bank}) => ({bank:bank})))  

  it(' can build a Tx for Initialising a Marlowe Contract' + 
     '(can POST: /contracts/ )', async () => {                           
    const exercise 
      = pipe( setup              
            , TE.chainFirst(() => TE.of(log('############')))
            , TE.chainFirst(() => TE.of(log('# Exercise #')))
            , TE.chainFirst(() => TE.of(log('############')))
            , TE.bind('postContractResponse',({bank}) => 
                 restApi.contracts.post(  { contract: close
                                          , version: 'v1'
                                          , metadata: {}
                                          , tags : {}
                                          , minUTxODeposit: 2_000_000}
                                        , { changeAddress: bank.address
                                          , usedAddresses: O.none
                                          , collateralUTxOs: O.none}))
            , TE.map (({postContractResponse}) => postContractResponse)
            )
    
    const result = await pipe(exercise, TE.match(
      (e) => { console.dir(e, { depth: null }); expect(e).not.toBeDefined()},
      () => {})) ()
                              
  },10_000),
  it('can Initialise a Marlowe Contract ' + 
     '(can POST: /contracts/ => build the Tx server side' +
     ' and PUT : /contracts/{contractid} => Append the Contract Tx to the Cardano ledger' + 
     ' and GET /contracts/{contractid} => provide details about the contract initialised)', async () => {            
      const exercise 
        = pipe( setup              
              , TE.chainFirst(() => TE.of(log('############')))
              , TE.chainFirst(() => TE.of(log('# Exercise #')))
              , TE.chainFirst(() => TE.of(log('############')))
              , TE.bindW('contractDetails',({bank}) => 
                    Initialise
                      (restApi)
                      ( { contract: close
                          , version: 'v1'
                          , metadata: {}
                          , tags : {}
                          , minUTxODeposit: 2_000_000}
                        , { changeAddress: bank.address
                          , usedAddresses: O.none
                          , collateralUTxOs: O.none}
                        , bank.signMarloweTx))
              , TE.map (({contractDetails}) => contractDetails))
      
      const result = await pipe(exercise, TE.match(
        (e) => { console.dir(e, { depth: null }); 
                 expect(e).not.toBeDefined()},
        () => {})) ()
                                
  },10_000),
  it('can navigate throught Initialised Marlowe Contracts pages' + 
     '(GET:  /contracts/)', async () => {            
    const exercise 
      = pipe( setup              
            , TE.chainFirst(() => TE.of(log('############')))
            , TE.chainFirst(() => TE.of(log('# Exercise #')))
            , TE.chainFirst(() => TE.of(log('############')))
            , TE.bindW('firstPage' ,()             => restApi.contracts.getHeadersByRange(O.none)) 
            , TE.bindW('secondPage',({firstPage})  => restApi.contracts.getHeadersByRange(firstPage.nextRange))
            , TE.bindW('thirdPage' ,({secondPage}) => restApi.contracts.getHeadersByRange(secondPage.nextRange))
            , TE.map (({firstPage,secondPage,thirdPage}) => ({firstPage,secondPage,thirdPage})))
    
    const result = await pipe(exercise, TE.match(
      (e) => { console.dir(e, { depth: null }); expect(e).not.toBeDefined()},
      () => {})) ()
    
                              
  },10_000)
})

