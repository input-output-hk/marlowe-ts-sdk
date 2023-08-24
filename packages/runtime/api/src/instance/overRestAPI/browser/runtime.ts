import * as T from 'fp-ts/lib/Task.js'
import { pipe } from 'fp-ts/lib/function.js';

import { getExtensionInstance } from '@marlowe.io/wallet/browser';
import * as Generic from '../runtime.js';
import { Runtime } from '../../../apis/runtime.js';

import { mkRestClient } from '@marlowe.io/runtime-rest-client';

export const mkRuntime
  : (runtimeURL : string)
  => (extensionName : string)
  => T.Task<Runtime> =
  (runtimeURL) => (extensionName) =>
    pipe( getExtensionInstance (extensionName)
        , T.map (Generic.mkRuntime (mkRestClient(runtimeURL))))

