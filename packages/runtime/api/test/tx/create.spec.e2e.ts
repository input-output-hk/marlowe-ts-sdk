
import { pipe } from 'fp-ts/lib/function.js'
import * as TE from 'fp-ts/lib/TaskEither.js';
import * as O from 'fp-ts/lib/Option.js';

import { close } from '@marlowe.io/language-core-v1'
import { create } from '@marlowe.io/runtime/tx';
import { mkRestClient } from '@marlowe.io/runtime-rest-client/index.js';

import { initialiseBankAndverifyProvisionning } from '../provisionning.js';
import { getBankPrivateKey, getBlockfrostContext, getMarloweRuntimeUrl } from '../context.js';

import console from "console"
global.console = console

describe('Marlowe Tx Commands', () => {

  const restClient = mkRestClient(getMarloweRuntimeUrl())

    it('can create a Marlowe Contract ' , async () => {
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

      }, 100_000)
})

