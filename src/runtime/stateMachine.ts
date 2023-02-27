import * as Internal from './endpoints';
import * as TE from 'fp-ts/TaskEither'
import { DecodingError } from './common/codec';
import { RolesConfig } from './contract/role';
import { Contract } from '../language/core/v1/semantics/contract';
import { ContractDetails } from './contract/details';
import { WalletDetails } from './common/wallet';
import { HexTransactionWitnessSet, MarloweTxCBORHex } from './common/textEnvelope';


export class MarloweStateMachine {
  private restClient;
  
  public constructor (baseURL: string) {
    this.restClient = Internal.AxiosRestClient(baseURL);
  }

  public initialise 
          ( contract : Contract
          , signAndRetrieveOnlyHexTransactionWitnessSet : (tx :MarloweTxCBORHex) => TE.TaskEither<Error,HexTransactionWitnessSet>
          , walletDetails:WalletDetails
          , roles?: RolesConfig
          ) : TE.TaskEither<Error | DecodingError,ContractDetails>  { 
    return Internal.Initialise 
                    (this.restClient)
                    ( { contract: contract
                      , roles: roles
                      , version: 'v1'
                      , metadata: {}
                      , tags : {}
                      , minUTxODeposit: 3_000_000}
                    , walletDetails
                    , signAndRetrieveOnlyHexTransactionWitnessSet)
               
  }


}


