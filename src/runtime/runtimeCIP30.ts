import { mkRuntimeRestAPI } from './restAPI';
import * as T from 'fp-ts/Task'
import { pipe } from 'fp-ts/lib/function';

import { getExtensionInstance } from '../wallet/cip30/index.ts';
import { mkRuntime, Runtime } from '.';

export const mkRuntimeCIP30 
  : (runtimeURL : string) 
  => (extensionName : string) 
  => T.Task<Runtime> = 
  (runtimeURL) => (extensionName) => 
    pipe( getExtensionInstance (extensionName) 
        , T.map (mkRuntime (mkRuntimeRestAPI(runtimeURL))))
    
