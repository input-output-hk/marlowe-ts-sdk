
import { AxiosInstance } from 'axios';
import * as E from 'fp-ts/lib/Either.js'
import * as TE from 'fp-ts/lib/TaskEither.js'
import { pipe } from 'fp-ts/lib/function.js';
import * as HTTP from '../../common/http.js';
import { HexTransactionWitnessSet, transactionWitnessSetTextEnvelope } from '../../common/textEnvelope.js';
import { ContractDetails } from '../details.js';
import * as t from "io-ts/lib/index.js";
import {formatValidationErrors} from 'jsonbigint-io-ts-reporters'
import { DecodingError } from '../../common/codec.js';
import { ContractId, unContractId } from '../id.js';

export type GET = ( contractId: ContractId) => TE.TaskEither<Error | DecodingError, ContractDetails>

type GETPayload = t.TypeOf<typeof GETPayload>
const GETPayload = t.type({ links: t.type ({}), resource: ContractDetails})

export const getViaAxios:(axiosInstance: AxiosInstance) => GET
    = (axiosInstance) => (contractId) =>
        pipe(HTTP.Get(axiosInstance)
                ( contractEndpoint(contractId)
                , { headers: { Accept: 'application/json'
                             , 'Content-Type':'application/json'}})
            , TE.chainW( data => TE.fromEither(E.mapLeft(formatValidationErrors)(GETPayload.decode(data))))
            , TE.map( payload => payload.resource))

export type PUT = ( contractId: ContractId
                  , hexTransactionWitnessSet: HexTransactionWitnessSet)
                  => TE.TaskEither<Error,void>

export const putViaAxios:(axiosInstance: AxiosInstance) => PUT
    = (axiosInstance) => (contractId, hexTransactionWitnessSet) =>
        pipe(HTTP.Put(axiosInstance)
                ( contractEndpoint(contractId)
                , transactionWitnessSetTextEnvelope(hexTransactionWitnessSet)
                , { headers: { Accept: 'application/json'
                            , 'Content-Type':'application/json'}})
            )

const contractEndpoint = (contractId: ContractId):string =>
    (`/contracts/${encodeURIComponent(unContractId(contractId))}`)



