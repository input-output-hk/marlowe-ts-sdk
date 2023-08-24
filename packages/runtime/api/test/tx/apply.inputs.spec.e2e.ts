
import { pipe } from 'fp-ts/lib/function.js'
import * as TE from 'fp-ts/lib/TaskEither.js'
import * as O from 'fp-ts/lib/Option.js';
import { addDays } from 'date-fns/fp';

import { datetoTimeout, inputNotify } from '@marlowe.io/language-core-v1';
import { oneNotifyTrue } from '@marlowe.io/language-core-v1/examples'
import { mkRestClient } from '@marlowe.io/runtime-rest-client/index.js';

import { getBankPrivateKey, getBlockfrostContext, getMarloweRuntimeUrl } from '../context.js';
import { initialiseBankAndverifyProvisionning } from '../provisionning.js'
import console from "console"

global.console = console

describe('Marlowe Tx Commands', () => {

  it('can Apply Inputs', async () => {
    await
      pipe( initialiseBankAndverifyProvisionning
              (mkRestClient(getMarloweRuntimeUrl()))
              (getBlockfrostContext ())
              (getBankPrivateKey())
          , TE.let (`notifyTimeout`,   () => pipe(Date.now(),addDays(1),datetoTimeout))
          , TE.bind('result',({restAPI,runtime,bank,notifyTimeout}) =>
                pipe
                  ( runtime.txCommand.create ({ contract: oneNotifyTrue(notifyTimeout)})
                  , TE.chainW ((contractId) => runtime.txCommand.applyInputs(contractId) ((next) => ({ inputs : [inputNotify]})))
                  , TE.chainW ( contractId => restAPI.contracts.contract.transactions.getHeadersByRange (contractId,O.none))
                  , TE.map ((result) =>  expect(result.headers.length).toBe(1))))
          , TE.match(
              (e) => { console.dir(e, { depth: null }); expect(e).not.toBeDefined()},
              () => {})
          ) ()
  },100_000)
})



