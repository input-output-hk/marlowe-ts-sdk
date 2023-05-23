
import * as T from 'fp-ts/Task'
import * as TE from 'fp-ts/TaskEither'
import * as ContractCollection from '../../runtime/contract/endpoints/collection';
import * as TransactionCollection from '../../runtime/contract/transaction/endpoints/collection';
import * as WithdrawalCollection from '../../runtime/contract/withdrawal/endpoints/collection';
import { DecodingError } from '../../runtime/common/codec';
import { ContractDetails } from '../../runtime/contract/details';
import { pipe } from 'fp-ts/function'
import { ContractId } from '../../runtime/contract/id';
import * as Contract from '../../runtime/contract/id';
import * as Tx from '../../runtime/contract/transaction/id';
import * as Transaction from '../../runtime/contract/transaction/details';
import * as Withdrawal from '../../runtime/contract/withdrawal/details';
import * as WithdrawalId from '../../runtime/contract/withdrawal/id';
import { RestAPI } from '../../runtime/endpoints';
import { WalletAPI, getAddressesAndCollaterals } from '../wallet';

export type InitialisePayload  = ContractCollection.PostContractsRequest
export type ApplyInputsPayload = TransactionCollection.PostTransactionsRequest
export type WithdrawPayload = WithdrawalCollection.PostWithdrawalsRequest

export const initialise 
  :  (client : RestAPI)
  => (wallet : WalletAPI)
  => (payload : InitialisePayload)
  => TE.TaskEither<Error | DecodingError,ContractDetails> 
  = (client) => (wallet) => (payload) =>  
      pipe( getAddressesAndCollaterals (wallet)
          , TE.fromTask 
          , TE.chain((addressesAndCollaterals) => client.contracts.post( payload, addressesAndCollaterals))
          , TE.chainW((contractTextEnvelope) => 
                pipe ( wallet.signTxTheCIP30Way(contractTextEnvelope.tx.cborHex)
                    , TE.chain((hexTransactionWitnessSet) => 
                          client.contracts.contract.put( contractTextEnvelope.contractId, hexTransactionWitnessSet))
                    , TE.map (() => contractTextEnvelope.contractId)))
          , TE.chainFirstW((contractId) => wallet.waitConfirmation(pipe(contractId, Contract.idToTxId)))
          , TE.chainW ((contractId) => client.contracts.contract.get(contractId)))

export const applyInputs 
  :  (client : RestAPI)
  => (wallet : WalletAPI)
  => (contractId : ContractId) 
  => (payload : ApplyInputsPayload) 
  => TE.TaskEither<Error | DecodingError,Transaction.Details> 
  = (client) => (wallet) => (contractId) => (payload) =>   
      pipe( getAddressesAndCollaterals (wallet)
          , TE.fromTask 
          , TE.chain((addressesAndCollaterals) => client.contracts.contract.transactions.post(contractId, payload, addressesAndCollaterals))
          , TE.chainW((transactionTextEnvelope) => 
                pipe ( wallet.signTxTheCIP30Way(transactionTextEnvelope.tx.cborHex)
                      , TE.chain((hexTransactionWitnessSet) => 
                          client.contracts.contract.transactions.transaction.put( contractId,transactionTextEnvelope.transactionId, hexTransactionWitnessSet))
                      , TE.map (() => transactionTextEnvelope.transactionId)))
          , TE.chainFirstW((transactionId) => wallet.waitConfirmation(pipe(transactionId, Tx.idToTxId)))
          , TE.chainW ((transactionId) => 
              client.contracts.contract.transactions.transaction.get(contractId,transactionId)))

export const withdraw 
    :  (client : RestAPI)
    => (wallet : WalletAPI) 
    => (payload : WithdrawPayload) 
    => TE.TaskEither<Error | DecodingError,Withdrawal.Details> 
    = (client) => (wallet) => (payload) =>   
        pipe( getAddressesAndCollaterals (wallet)
            , TE.fromTask 
            , TE.chain((addressesAndCollaterals) => client.withdrawals.post (payload, addressesAndCollaterals)) 
            , TE.chainW( (withdrawalTextEnvelope) =>
                pipe ( wallet.signTxTheCIP30Way(withdrawalTextEnvelope.tx.cborHex)  
                     , TE.chain ((hexTransactionWitnessSet) => client.withdrawals.withdrawal.put(withdrawalTextEnvelope.withdrawalId,hexTransactionWitnessSet))
                     , TE.map (() => withdrawalTextEnvelope.withdrawalId)))
            , TE.chainFirstW((withdrawalId) => wallet.waitConfirmation(pipe(withdrawalId, WithdrawalId.idToTxId)))
            , TE.chainW ((withdrawalId) => client.withdrawals.withdrawal.get(withdrawalId)) ) 