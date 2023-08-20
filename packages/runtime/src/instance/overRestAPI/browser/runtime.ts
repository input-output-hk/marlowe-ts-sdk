import { mkRestClient } from '@marlowe.io/client-rest/index.js';
import * as T from 'fp-ts/lib/Task.js'
import { pipe } from 'fp-ts/lib/function.js';

import { getExtensionInstance } from '@marlowe.io/wallet/browser';
import { mkRuntime } from '../runtime.js';
import { Runtime } from '../../../api.js';

export const mkRuntimeBroswer
  : (runtimeURL : string)
  => (extensionName : string)
  => T.Task<Runtime> =
  (runtimeURL) => (extensionName) =>
    pipe( getExtensionInstance (extensionName)
        , T.map (mkRuntime (mkRestClient(runtimeURL))))

