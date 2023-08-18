import { mkRuntimeRestAPI } from '../../src/restAPI.js';
import * as T from 'fp-ts/lib/Task.js';
import { pipe } from 'fp-ts/lib/function.js';

import * as S from './wallet/singleAddress/index.js';
import { mkRuntime, Runtime } from '../../src/runtime.js';

export const mkRuntimeSingleAddress
  : (runtimeURL : string)
  =>  ( context:S.Context)
  => (privateKeyBech32: string)
  => T.Task<Runtime> =
  (runtimeURL) =>(context) => (privateKeyBech32) =>
    pipe( S.SingleAddressWallet.Initialise (context,privateKeyBech32)
        , T.map (mkRuntime (mkRuntimeRestAPI(runtimeURL))))
