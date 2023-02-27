
/* eslint-disable sort-keys-fix/sort-keys-fix */
/* eslint-disable no-use-before-define */
import axios from 'axios';
import { AxiosInstance, AxiosResponse } from 'axios';
import { Address } from 'lucid-cardano';
import * as E from 'fp-ts/Either'
import * as TE from 'fp-ts/TaskEither'
import { flow, identity, pipe } from 'fp-ts/lib/function';
import { Newtype, iso } from 'newtype-ts'
import * as HTTP from '../../common/http';
import { Header } from '../header';
import { HexTransactionWitnessSet, TextEnvelope, transactionWitnessSetTextEnvelope } from '../../common/textEnvelope';
import { ContractDetails } from '../details';
import * as t from "io-ts";
import {formatValidationErrors} from 'io-ts-reporters'
import { DecodingError } from 'runtime/common/codec';
import { ContractId, unContractId } from '../id';

export type GET = ( contractId: ContractId) => TE.TaskEither<Error | DecodingError, ContractDetails>

type GETPayload = t.TypeOf<typeof GETPayload>
const GETPayload = t.type({ links: t.type ({}), resource: ContractDetails})

export const getViaAxios:(axiosInstance: AxiosInstance) => GET
    = (axiosInstance) => (contractId) => 
        pipe(HTTP.Get(axiosInstance)
                ( contractEndpoint(contractId)
                , { headers: { Accept: 'application/json', 'Content-Type':'application/json'}})
            , TE.chainW((data) => TE.fromEither(E.mapLeft(formatValidationErrors)(GETPayload.decode(data))))
            , TE.map((payload) => payload.resource))

export type PUT = ( contractId: ContractId
                  , hexTransactionWitnessSet: HexTransactionWitnessSet) 
                  => TE.TaskEither<Error,void>

export const putViaAxios:(axiosInstance: AxiosInstance) => PUT
    = (axiosInstance) => (contractId, hexTransactionWitnessSet) => 
        pipe(HTTP.Put(axiosInstance)
                ( contractEndpoint(contractId)
                , transactionWitnessSetTextEnvelope(hexTransactionWitnessSet)
                , { headers: { Accept: 'application/json', 'Content-Type':'application/json'}})
            )



const contractEndpoint = (contractId: ContractId):string => 
    (`/contracts/${encodeURIComponent(unContractId(contractId))}`)



