import { mkRestClient } from '@marlowe.io/runtime-rest-client/index.js';
import * as T from 'fp-ts/lib/Task.js';
import { pipe } from 'fp-ts/lib/function.js';

import * as S from '@marlowe.io/wallet/nodejs';;
import * as Generic from '../runtime.js';
import { Runtime } from '../../../apis/runtime.js';

export const mkRuntime
  : (runtimeURL : string)
  =>  ( context:S.Context)
  => (privateKeyBech32: string)
  => T.Task<Runtime> =
  (runtimeURL) =>(context) => (privateKeyBech32) =>
    pipe( S.SingleAddressWallet.Initialise (context,privateKeyBech32)
        , T.map (Generic.mkRuntime (mkRestClient(runtimeURL))))
