
/* eslint-disable sort-keys-fix/sort-keys-fix */
/* eslint-disable no-use-before-define */
import { AxiosInstance } from 'axios';
import * as E from 'fp-ts/lib/Either.js'
import * as TE from 'fp-ts/lib/TaskEither.js'
import { pipe } from 'fp-ts/lib/function.js';
import * as HTTP from '@marlowe.io/adapter/http';

import {formatValidationErrors} from 'jsonbigint-io-ts-reporters'

import { unWithdrawalId, WithdrawalId } from '../id.js';
import { Details } from '../details.js';
import { DecodingError } from '@marlowe.io/adapter/codec';
import { HexTransactionWitnessSet, transactionWitnessSetTextEnvelope } from '@marlowe.io/core/cardano';


export type GET = ( withdrawalId: WithdrawalId) => TE.TaskEither<Error | DecodingError, Details>

export const getViaAxios:(axiosInstance: AxiosInstance) => GET
    = (axiosInstance) => (withdrawalId) =>
        pipe(HTTP.Get(axiosInstance)
                ( endpointURI(withdrawalId)
                , { headers: { Accept: 'application/json','Content-Type':'application/json'}})
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



