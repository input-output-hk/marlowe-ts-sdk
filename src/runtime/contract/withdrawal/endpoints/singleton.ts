
/* eslint-disable sort-keys-fix/sort-keys-fix */
/* eslint-disable no-use-before-define */
import { AxiosInstance } from 'axios';
import * as E from 'fp-ts/Either'
import * as TE from 'fp-ts/TaskEither'
import { pipe } from 'fp-ts/lib/function';
import * as HTTP from '@runtime/common/http';
import { HexTransactionWitnessSet, transactionWitnessSetTextEnvelope } from '@runtime/common/textEnvelope';

import {formatValidationErrors} from 'io-ts-reporters'
import { DecodingError } from '@runtime/common/codec';
import { unWithdrawalId, WithdrawalId } from '../id';
import { Details } from '../details';


export type GET = ( withdrawalId: WithdrawalId) => TE.TaskEither<Error | DecodingError, Details>

export const getViaAxios:(axiosInstance: AxiosInstance) => GET
    = (axiosInstance) => (withdrawalId) => 
        pipe(HTTP.Get(axiosInstance)
                ( endpointURI(withdrawalId)
                , { headers: { Accept: 'application/json', 'Content-Type':'application/json'}})
            , TE.chainW((data) => TE.fromEither(E.mapLeft(formatValidationErrors)(Details.decode(data)))))

export type PUT = ( withdrawalId: WithdrawalId
                  , hexTransactionWitnessSet: HexTransactionWitnessSet) 
                  => TE.TaskEither<Error,void>

export const putViaAxios:(axiosInstance: AxiosInstance) => PUT
    = (axiosInstance) => (withdrawalId, hexTransactionWitnessSet) => 
        pipe(HTTP.Put(axiosInstance)
                ( endpointURI(withdrawalId)
                , transactionWitnessSetTextEnvelope(hexTransactionWitnessSet)
                , { headers: { Accept: 'application/json', 'Content-Type':'application/json'}})
            )



const endpointURI = (withdrawalId: WithdrawalId):string => 
    (`/withdrawals/${encodeURIComponent(unWithdrawalId(withdrawalId))}`)



