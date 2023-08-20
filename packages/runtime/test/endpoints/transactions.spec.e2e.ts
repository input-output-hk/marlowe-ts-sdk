
import { pipe } from 'fp-ts/lib/function.js'
import * as TE from 'fp-ts/lib/TaskEither.js'
import * as O from 'fp-ts/lib/Option.js';
import { addDays } from 'date-fns/fp';
import { addMinutes, subMinutes } from 'date-fns'

import { datetoTimeout, inputNotify } from '@marlowe.io/language-core-v1';
import { oneNotifyTrue } from '@marlowe.io/language-core-v1/examples'
import { datetoIso8601Bis } from '@marlowe.io/adapter/time'
import { mkRuntimeRestAPI } from '@marlowe.io/runtime/restClient';

import { getBankPrivateKey, getBlockfrostContext, getMarloweRuntimeUrl } from '../context.js';
import { initialiseBankAndverifyProvisionning } from '../provisionning.js'
import console from "console"

global.console = console

describe('Contracts/{contractd}/Transactions endpoints', () => {

  it('can Build Apply Input Tx : ' +
     '(can POST: /contracts/{contractId}/transactions => ask to build the Tx to apply input on an initialised Marlowe Contract)', async () => {
    await
      pipe( initialiseBankAndverifyProvisionning
              (mkRuntimeRestAPI(getMarloweRuntimeUrl()))
              (getBlockfrostContext ())
              (getBankPrivateKey())
          , TE.let (`notifyTimeout`,   () => pipe(Date.now(),addDays(1),datetoTimeout))
          , TE.bind('result',({runtimeRestAPI,runtime,bank,notifyTimeout}) =>
                pipe
                  ( runtime.create
                    ( { contract: oneNotifyTrue(notifyTimeout)})
                  , TE.chainW ((contractId) =>
                     runtimeRestAPI.contracts.contract.transactions.post
                        (contractId
                        , { version : "v1"
                          , inputs : [inputNotify]
                          , metadata : {}
                          , tags : {}
                          , invalidBefore    : pipe(Date.now(),(date) => subMinutes(date,5),datetoIso8601Bis)
                          , invalidHereafter : pipe(Date.now(),(date) => addMinutes(date,5),datetoIso8601Bis) }
                        , { changeAddress: bank.address
                          , usedAddresses: O.none
                          , collateralUTxOs: O.none}) )
                  ))
          , TE.map (({result}) => result)
          , TE.match(
              (e) => { console.dir(e, { depth: null }); expect(e).not.toBeDefined()},
              () => {})
          ) ()

  },100_000),
  it('can Apply Inputs : ' +
     '(can POST: /contracts/{contractId}/transactions => ask to build the Tx to apply input on an initialised Marlowe Contract' +
     ' ,   PUT:  /contracts/{contractId}/transactions/{transactionId} => Append the Applied Input Tx to the ledger' +
     ' ,   GET:  /contracts/{contractId}/transactions/{transactionId} => retrieve the Tx state' +
     ' and GET : /contracts/{contractId}/transactions => should see the unsigned transaction listed)', async () => {
    await
      pipe( initialiseBankAndverifyProvisionning
              (mkRuntimeRestAPI(getMarloweRuntimeUrl()))
              (getBlockfrostContext ())
              (getBankPrivateKey())
          , TE.let (`notifyTimeout`,   () => pipe(Date.now(),addDays(1),datetoTimeout))
          , TE.bind('result',({runtimeRestAPI,runtime,bank,notifyTimeout}) =>
                pipe
                  ( runtime.create ({ contract: oneNotifyTrue(notifyTimeout)})
                  , TE.chainW ((contractId) => runtime.applyInputs(contractId) ((next) => ({ inputs : [inputNotify]})))
                  , TE.chainW ( contractId => runtimeRestAPI.contracts.contract.transactions.getHeadersByRange (contractId,O.none))
                  , TE.map ((result) =>  expect(result.headers.length).toBe(1))))
          , TE.match(
              (e) => { console.dir(e, { depth: null }); expect(e).not.toBeDefined()},
              () => {})
          ) ()
  },100_000)
})



