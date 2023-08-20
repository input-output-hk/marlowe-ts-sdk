import { mkRuntimeRestAPI } from './client/index..js';
import * as T from 'fp-ts/lib/Task.js'
import { pipe } from 'fp-ts/lib/function.js';

import { getExtensionInstance } from './wallet/cip30/index.js';
import { mkRuntime, Runtime } from './runtime.js';

export const mkRuntimeCIP30
  : (runtimeURL : string)
  => (extensionName : string)
  => T.Task<Runtime> =
  (runtimeURL) => (extensionName) =>
    pipe( getExtensionInstance (extensionName)
        , T.map (mkRuntime (mkRuntimeRestAPI(runtimeURL))))

