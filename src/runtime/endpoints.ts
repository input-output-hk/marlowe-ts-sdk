/* eslint-disable sort-keys-fix/sort-keys-fix */
/* eslint-disable no-use-before-define */
import axios from 'axios';
import * as TE from 'fp-ts/TaskEither'
import * as HTTP from './common/http';
import * as WithdrawalSingleton from './withdrawals/endpoints/singleton';
import * as WithdrawalCollection from './withdrawals/endpoints/collection';
import * as ContractSingleton from './contract/endpoints/singleton';
import * as ContractCollection from './contract/endpoints/collection';
import * as TransactionSingleton from './contract/transaction/endpoints/singleton';
import * as TransactionCollection from './contract/transaction/endpoints/collection';
import curlirize from 'axios-curlirize';
import { MarloweJSONCodec } from '../common/json';
import { DecodingError } from './common/codec';
import { ContractDetails } from './contract/details';
import { pipe } from 'fp-ts/function'
import { WalletDetails } from './common/wallet';
import { HexTransactionWitnessSet, MarloweTxCBORHex } from './common/textEnvelope';
import { ContractId } from './contract/id';
import * as Transaction from './contract/transaction/details';


export interface RestAPI {
  healthcheck : () => TE.TaskEither<Error,Boolean>
  withdrawals: {
    getHeadersByRange: WithdrawalCollection.GETHeadersByRange
    post: WithdrawalCollection.POST
    withdrawal: {
      get: WithdrawalSingleton.GET
      put: WithdrawalSingleton.PUT
    }
  }
  contracts: {
    getHeadersByRange: ContractCollection.GETHeadersByRange
    post: ContractCollection.POST
    contract: {
      get: ContractSingleton.GET
      put: ContractSingleton.PUT
      transactions: {
        getHeadersByRange: TransactionCollection.GETHeadersByRange
        post: TransactionCollection.POST
        transaction: {
          get: TransactionSingleton.GET
          put: TransactionSingleton.PUT
        }
      }
    }
  }
}

export const AxiosRestClient = function (baseURL: string): RestAPI {
  const axiosInstance = axios.create(
    { baseURL:baseURL
      , transformRequest: MarloweJSONCodec.encode
      , transformResponse: MarloweJSONCodec.decode
    })
    
  curlirize(axiosInstance)  
  return {
    healthcheck: () => HTTP.Get(axiosInstance)('/healthcheck'),
    withdrawals: {
      getHeadersByRange: WithdrawalCollection.getHeadersByRangeViaAxios(axiosInstance),
      post: WithdrawalCollection.postViaAxios(axiosInstance),
      withdrawal: {
        get: WithdrawalSingleton.getViaAxios(axiosInstance),
        put: WithdrawalSingleton.putViaAxios(axiosInstance)}}, 
    contracts: {
      getHeadersByRange:  ContractCollection.getHeadersByRangeViaAxios(axiosInstance),
      post: ContractCollection.postViaAxios(axiosInstance),
      contract: {
        get: ContractSingleton.getViaAxios(axiosInstance),
        put: ContractSingleton.putViaAxios(axiosInstance),
        transactions: {
          getHeadersByRange: TransactionCollection.getHeadersByRangeViaAxios(axiosInstance),
          post: TransactionCollection.postViaAxios(axiosInstance),
          transaction: {
            get: TransactionSingleton.getViaAxios(axiosInstance),
            put: TransactionSingleton.putViaAxios(axiosInstance)
          }
        }
      }
    }
  }
}


export type InitialisePayload  = ContractCollection.PostContractsRequest
export type ApplyInputsPayload = TransactionCollection.PostTransactionsRequest


export const initialise : 
  (client : RestAPI)
    => (signAndRetrieveOnlyHexTransactionWitnessSet : (tx :MarloweTxCBORHex) => TE.TaskEither<Error,HexTransactionWitnessSet>) 
    => (walletDetails:WalletDetails) 
    => (payload : InitialisePayload)
    => TE.TaskEither<Error | DecodingError,ContractDetails> 
  = (client) => (sign) => (walletDetails) => (payload) =>  
      pipe( client.contracts.post( payload, walletDetails)
          , TE.chainW((contractTextEnvelope) => 
                pipe ( sign(contractTextEnvelope.tx.cborHex)
                    , TE.chain((hexTransactionWitnessSet) => 
                          client.contracts.contract.put( contractTextEnvelope.contractId, hexTransactionWitnessSet))
                    , TE.map (() => contractTextEnvelope.contractId)))
          , TE.chainW ((contractId) => client.contracts.contract.get(contractId)))

export const applyInputs : 
  (client : RestAPI)
  => (signAndRetrieveOnlyHexTransactionWitnessSet : (tx :MarloweTxCBORHex) => TE.TaskEither<Error,HexTransactionWitnessSet>)
  => (walletDetails:WalletDetails) 
  => (contractId : ContractId) 
  => ( payload : ApplyInputsPayload) 
  => TE.TaskEither<Error | DecodingError,Transaction.Details> 
  = (client) => (sign) => (walletDetails) => (contractId) => (payload) =>   
      pipe( client.contracts.contract.transactions.post(contractId, payload, walletDetails)
          , TE.chainW((transactionTextEnvelope) => 
                pipe ( sign(transactionTextEnvelope.tx.cborHex)
                      , TE.chain((hexTransactionWitnessSet) => 
                          client.contracts.contract.transactions.transaction.put( contractId,transactionTextEnvelope.transactionId, hexTransactionWitnessSet))
                      , TE.map (() => transactionTextEnvelope.transactionId)))
          , TE.chainW ((transactionId) => 
              client.contracts.contract.transactions.transaction.get(contractId,transactionId)))