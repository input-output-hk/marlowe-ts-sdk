
import { pipe } from 'fp-ts/lib/function.js'
import * as TE from 'fp-ts/lib/TaskEither.js';
import * as O from 'fp-ts/lib/Option.js';

import { close } from '@marlowe.io/language-core-v1'
import { mkRestClient } from '@marlowe.io/runtime/restClient';
import { create } from '@marlowe.io/runtime/txCommand';

import { initialiseBankAndverifyProvisionning } from '../provisionning.js';
import { getBankPrivateKey, getBlockfrostContext, getMarloweRuntimeUrl } from '../context.js';

import console from "console"
global.console = console

describe('contracts endpoints', () => {

  const restClient = mkRestClient(getMarloweRuntimeUrl())

  it(' can build a Tx for Initialising a Marlowe Contract' +
    '(can POST: /contracts/ )', async () => {
      await
        pipe(initialiseBankAndverifyProvisionning
          (restClient)
          (getBlockfrostContext())
          (getBankPrivateKey())
          , TE.bind('postContractResponse', ({ bank }) =>
            restClient.contracts.post({
              contract: close
              , version: 'v1'
              , metadata: {}
              , tags: {}
              , minUTxODeposit: 2_000_000
            }
              , {
                changeAddress: bank.address
                , usedAddresses: O.none
                , collateralUTxOs: O.none
              }))
          , TE.map(({ postContractResponse }) => postContractResponse)
          , TE.match(
            (e) => { console.dir(e, { depth: null }); expect(e).not.toBeDefined() },
            () => { }))()

    }, 100_000),
    it('can Initialise a Marlowe Contract ' +
      '(can POST: /contracts/ => build the Tx server side' +
      ' and PUT : /contracts/{contractid} => Append the Contract Tx to the Cardano ledger' +
      ' and GET /contracts/{contractid} => provide details about the contract initialised)', async () => {
        await
          pipe(initialiseBankAndverifyProvisionning
            (restClient)
            (getBlockfrostContext())
            (getBankPrivateKey())
            , TE.bindW('contracId', ({ bank }) => create (restClient)(bank)({contract: close}))
            , TE.match(
              (e) => {
                console.dir(e, { depth: null });
                expect(e).not.toBeDefined()
              },
              (result) => {console.log("contractID created" ,result.contracId) }))()

      }, 100_000),
    it('can navigate throught Initialised Marlowe Contracts pages' +
      '(GET:  /contracts/)', async () => {
        await
          pipe(initialiseBankAndverifyProvisionning
            (restClient)
            (getBlockfrostContext())
            (getBankPrivateKey())
            , TE.bindW('firstPage', () => restClient.contracts.getHeadersByRange(O.none)(['swap.L1.by.marlowe.team', "initialised"]))
            , TE.match(
              (e) => { console.dir(e, { depth: null }); expect(e).not.toBeDefined() },
              (a) => { console.log("result",a.firstPage.headers.length)}))()


      }, 100_000)
})

