
import * as TE from 'fp-ts/lib/TaskEither.js'
import * as E from 'fp-ts/lib/Either.js'
import { pipe } from 'fp-ts/lib/function.js';
import * as t from "io-ts/lib/index.js";

import { AxiosInstance } from "axios";
import { formatValidationErrors } from "jsonbigint-io-ts-reporters";

import * as HTTP from '@marlowe.io/adapter/http';
import { DecodingError } from '@marlowe.io/adapter/codec';

import { HexTransactionWitnessSet, transactionWitnessSetTextEnvelope } from '@marlowe.io/runtime-core';

import { Details } from "../details.js";
import { ContractId, unContractId } from "@marlowe.io/runtime-core";
import { TransactionId, unTransactionId } from "../id.js";

export type GET = ( contractId: ContractId, transactionId : TransactionId) => TE.TaskEither<Error | DecodingError, Details>

type GETPayload = t.TypeOf<typeof GETPayload>
const GETPayload = t.type({ links: t.type ({}), resource: Details})

export const getViaAxios:(axiosInstance: AxiosInstance) => GET
    = (axiosInstance) => (contractId,transactionId) =>
        pipe(HTTP.Get(axiosInstance)
                ( endpointURI(contractId,transactionId)
                , { headers: { Accept: 'application/json', 'Content-Type':'application/json'}})
            , TE.chainW((data) => TE.fromEither(E.mapLeft(formatValidationErrors)(GETPayload.decode(data))))
            , TE.map((payload) => payload.resource))

export type PUT = ( contractId: ContractId
                  , transactionId : TransactionId
                  , hexTransactionWitnessSet: HexTransactionWitnessSet)
                  => TE.TaskEither<Error,void>

export const putViaAxios:(axiosInstance: AxiosInstance) => PUT
    = (axiosInstance) => (contractId,transactionId, hexTransactionWitnessSet) =>
        pipe(HTTP.Put(axiosInstance)
                ( endpointURI(contractId,transactionId)
                , transactionWitnessSetTextEnvelope(hexTransactionWitnessSet)
                , { headers: { Accept: 'application/json', 'Content-Type':'application/json'}})
            )

const endpointURI = (contractId: ContractId, transactionId: TransactionId):string =>
    (`/contracts/${pipe(contractId,unContractId,encodeURIComponent)}/transactions/${pipe(transactionId,unTransactionId,encodeURIComponent)}`)