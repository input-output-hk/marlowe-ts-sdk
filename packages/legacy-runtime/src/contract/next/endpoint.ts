import { AxiosInstance } from 'axios';
import * as E from 'fp-ts/lib/Either.js'
import * as TE from 'fp-ts/lib/TaskEither.js'
import { pipe } from 'fp-ts/lib/function.js';
import * as HTTP from '../../common/http.js';
import {formatValidationErrors} from 'jsonbigint-io-ts-reporters'
import { DecodingError } from '../../common/codec.js';
import { ContractId, unContractId } from '../id.js';
import { Environment } from '@marlowe/language-core-v1/environment';
import { Next } from '@marlowe/language-core-v1/next';
import { Party } from '@marlowe/language-core-v1/semantics/contract/common/payee/party.js';
import { stringify } from 'qs';

export type GET
    =  ( contractId: ContractId)
    => (environment : Environment)
    => (parties : Party[])
    => TE.TaskEither<Error | DecodingError, Next>

export const getViaAxios:(axiosInstance: AxiosInstance) => GET
    = (axiosInstance) => (contractId) => (environment) => (parties) =>
        pipe(HTTP.Get(axiosInstance)
                ( contractNextEndpoint(contractId)
                    + `?validityStart=${environment.validityStart}&validityEnd=${environment.validityEnd}`
                    +  stringify(({party:parties}), { indices: false })
                , { headers: { Accept: 'application/json'
                             , 'Content-Type':'application/json'}})
            , TE.chainW( data =>
                    TE.fromEither(E.mapLeft(formatValidationErrors)(Next.decode(data)))))


const contractNextEndpoint = (contractId: ContractId):string =>
    (`/contracts/${encodeURIComponent(unContractId(contractId))}/next`)