
import * as ADA from '../../../../src/common/ada'
import { SingleAddressWallet} from '../../../../src/common/wallet'
import { pipe } from 'fp-ts/function'
import { close } from '../../../../src/language/core/v1/semantics/contract/close'
import { oneNotifyTrue } from '../../../../src/language/core/v1/examples/contract-one-notify'
import { log } from '../../../../src/common/logging'
import * as TE from 'fp-ts/TaskEither'

import * as T from 'fp-ts/Task'
import { getBankPrivateKey, getBlockfrostConfiguration, getMarloweRuntimeUrl } from '../../../../src/runtime/common/configuration';
import { applyInputs, AxiosRestClient, initialise } from '../../../../src/runtime/endpoints';
import '@relmify/jest-fp-ts'
import * as O from 'fp-ts/lib/Option';
import { addDays } from 'date-fns/fp'
import { datetoTimeout } from '../../../../src/language/core/v1/semantics/contract/when'
import * as Contract from '../../../../src/runtime/contract/id'
import * as Tx from '../../../../src/runtime/contract/transaction/id'
import { addMinutes, subMinutes } from 'date-fns'
import { datetoIso8601 } from '../../../../src/runtime/common/iso8601'
import { inputNotify } from '../../../../src/language/core/v1/semantics/contract/when/input/notify'


describe('Contracts/{contractd}/Transactions endpoints definitions', () => {

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
          , TE.map (({bank}) => ({bank : bank
                                 , initialise:initialise
                                    (restApi) 
                                    (bank.signMarloweTx)
                                    ({ changeAddress: bank.address
                                      , usedAddresses: O.none
                                      , collateralUTxOs: O.none})
                                  , applyInputs :applyInputs 
                                    (restApi) 
                                    (bank.signMarloweTx)
                                    ({ changeAddress: bank.address
                                      , usedAddresses: O.none
                                      , collateralUTxOs: O.none})})))  

  it.skip('can Build Apply Input Tx : ' + 
     '(can POST: /contracts/{contractId}/transactions => ask to build the Tx to apply input on an initialised Marlowe Contract' +
     ' and GET : /contracts/{contractId}/transactions => should see the unsigned transaction listed)', async () => {                           
    await  
      pipe( setup              
          , TE.chainFirst(() => TE.of(log('############')))
          , TE.chainFirst(() => TE.of(log('# Exercise #')))
          , TE.chainFirst(() => TE.of(log('############')))
          , TE.let (`notifyTimeout`,   () => pipe(Date.now(),addDays(1),datetoTimeout))
          , TE.bind('result',({initialise,bank,notifyTimeout}) =>
                pipe
                  ( initialise
                    ( { contract: oneNotifyTrue(notifyTimeout)
                        , version: 'v1'
                        , metadata: {}
                        , tags : {}
                        , minUTxODeposit: 2_000_000})
                  , TE.chainFirstW ((contractDetails) => 
                    bank.waitConfirmation(pipe(contractDetails.contractId, Contract.idToTxId)))
                  , TE.chainW ((contractDetails) =>       
                    restApi.contracts.contract.transactions.post
                        (contractDetails.contractId
                        , { version : "v1"
                          , inputs : [inputNotify]
                          , metadata : {}
                          , tags : {}
                          , invalidBefore    : pipe(Date.now(),(date) => subMinutes(date,5),datetoIso8601)
                          , invalidHereafter : pipe(Date.now(),(date) => addMinutes(date,5),datetoIso8601) }
                        , { changeAddress: bank.address
                          , usedAddresses: O.none
                          , collateralUTxOs: O.none}) )))
          , TE.map (({result}) => result)
          , TE.match(
              (e) => { console.dir(e, { depth: null }); expect(e).not.toBeDefined()},
              () => {})
          ) ()
                              
  },100_000),
  it('can Apply Inputs : ' + 
     '(can POST: /contracts/{contractId}/transactions => ask to build the Tx to apply input on an initialised Marlowe Contract' + 
     ' , PUT:  /contracts/{contractId}/transactions/{transactionId} => Append the Applied Input Tx to the ledger' + 
     ' , GET:  /contracts/{contractId}/transactions/{transactionId} => retrieve the Tx state)', async () => {
    await  
      pipe( setup              
          , TE.chainFirst(() => TE.of(log('############')))
          , TE.chainFirst(() => TE.of(log('# Exercise #')))
          , TE.chainFirst(() => TE.of(log('############')))
          , TE.let (`notifyTimeout`,   () => pipe(Date.now(),addDays(1),datetoTimeout))
          , TE.bind('result',({initialise,applyInputs,bank,notifyTimeout}) =>
                pipe
                  ( initialise
                    ( { contract: oneNotifyTrue(notifyTimeout)
                        , version: 'v1'
                        , metadata: {}
                        , tags : {}
                        , minUTxODeposit: 2_000_000})
                  , TE.chainFirstW ((contractDetails) => 
                        bank.waitConfirmation(pipe(contractDetails.contractId, Contract.idToTxId)))
                  , TE.chainW ((contractDetails) =>       
                        applyInputs
                          (contractDetails.contractId)
                          ({ version : "v1"
                            , inputs : [inputNotify]
                            , metadata : {}
                            , tags : {}}))
                  , TE.chainFirstW ((txDetails) => 
                        bank.waitConfirmation(pipe(txDetails.transactionId, Tx.idToTxId)))))
          , TE.map (({result}) => result)
          , TE.match(
              (e) => { console.dir(e, { depth: null }); expect(e).not.toBeDefined()},
              (res) => {console.dir(res, { depth: null });})
          ) ()                                      
  },100_000),
  it.skip('can navigate throught Apply Inputs Txs pages ' + 
          '(GET:  /contracts/{contractId}/transactions )', async () => {            
    const exercise 
      = pipe( setup              
            , TE.chainFirst(() => TE.of(log('############')))
            , TE.chainFirst(() => TE.of(log('# Exercise #')))
            , TE.chainFirst(() => TE.of(log('############')))
            , TE.bindW('firstPage' ,() => 
                restApi.contracts.contract.transactions.getHeadersByRange
                  (Contract.contractId("e72f18b5ec9afed70171b071192226b2625ca5f21716be8f9028ca392d75e899#1")
                  ,O.none)) 
            , TE.map (({firstPage}) => ({firstPage})))
    
    const result = await pipe(exercise, TE.match(
      (e) => { console.dir(e, { depth: null }); expect(e).not.toBeDefined()},
      () => {})) ()
    
                              
  },10_000)
})



