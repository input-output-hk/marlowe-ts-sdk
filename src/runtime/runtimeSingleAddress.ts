import { mkRuntimeRestAPI } from './restAPI';
import * as T from 'fp-ts/Task'
import { pipe } from 'fp-ts/lib/function';

import * as S from '../wallet/singleAddress';
import { mkRuntime, Runtime } from '.';



export const mkRuntimeSingleAddress 
  : (runtimeURL : string) 
  =>  ( context:S.Context) 
  => (privateKeyBech32: string) 
  => T.Task<Runtime> = 
  (runtimeURL) =>(context) => (privateKeyBech32) =>  
    pipe( S.SingleAddressWallet.Initialise (context,privateKeyBech32)
        , T.map (mkRuntime (mkRuntimeRestAPI(runtimeURL))))
