

import * as TE from 'fp-ts/lib/TaskEither.js'
import { WalletAPI } from '@marlowe.io/wallet/api';

import { RestAPI } from '@marlowe.io/runtime-rest-client/index.js';
import { TxAPI } from './tx.js';

export type Runtime =
  { wallet : WalletAPI & { getLovelaces : TE.TaskEither<Error,bigint>}
    restAPI : RestAPI 
    txCommand : TxAPI
  }
