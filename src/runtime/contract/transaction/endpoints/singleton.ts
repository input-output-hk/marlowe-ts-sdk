
import * as TE from 'fp-ts/TaskEither'
import * as E from 'fp-ts/Either'
import * as HTTP from '../../../../runtime/common/http';
import { pipe } from 'fp-ts/lib/function';
import { AxiosInstance } from "axios";
import { TransactionId, unTransactionId } from "../id";
import { ContractId, unContractId } from "../../id";
import { DecodingError } from "../../../../runtime/common/codec";
import * as t from "io-ts";
import { formatValidationErrors } from "io-ts-reporters";
import { Details } from "../details";
import { HexTransactionWitnessSet, transactionWitnessSetTextEnvelope } from "../../../../runtime/common/textEnvelope";

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