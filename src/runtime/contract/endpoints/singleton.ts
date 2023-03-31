
import { AxiosInstance } from 'axios';
import * as E from 'fp-ts/Either'
import * as TE from 'fp-ts/TaskEither'
import { pipe } from 'fp-ts/lib/function';
import * as HTTP from '../../../runtime/common/http';
import { HexTransactionWitnessSet, transactionWitnessSetTextEnvelope } from '../../../runtime/common/textEnvelope';
import { ContractDetails } from '../details';
import * as t from "io-ts";
import {formatValidationErrors} from 'io-ts-reporters'
import { DecodingError } from '../../../runtime/common/codec';
import { ContractId, unContractId } from '../id';

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



