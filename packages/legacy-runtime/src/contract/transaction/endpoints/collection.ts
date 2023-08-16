import * as t from "io-ts/lib/index.js";
import { Newtype, iso } from 'newtype-ts'
import * as E from 'fp-ts/lib/Either.js'
import * as A from 'fp-ts/lib/Array.js'
import * as O from 'fp-ts/lib/Option.js';
import * as TE from 'fp-ts/lib/TaskEither.js'
import { pipe } from 'fp-ts/lib/function.js';
import { formatValidationErrors } from "jsonbigint-io-ts-reporters";
import { fromNewtype, optionFromNullable } from 'io-ts-types';
import { AxiosInstance } from "axios";

import { ISO8601 } from "@marlowe/legacy-adapter/time";
import { Input } from "@marlowe/language-core-v1";

import * as HTTP from '../../../common/http.js';
import { unAddressBech32 } from "../../../common/address.js";
import { Metadata } from "../../../common/metadata/index.js";
import { AddressesAndCollaterals } from "../../../wallet/api.js";
import { DecodingError } from "../../../common/codec.js";
import { TextEnvelope } from "../../../common/textEnvelope.js";
import { MarloweVersion } from "../../../common/version.js";
import { Tags } from "../../../common/metadata/tag.js";
import { Header } from "../header.js";
import { TransactionId } from ".././id.js";
import { ContractId, unContractId } from "../../id.js";
import { unTxOutRef } from "../../../common/tx/outRef.js";

export interface TransactionsRange extends Newtype<{ readonly TransactionsRange: unique symbol }, string> {}
export const TransactionsRange = fromNewtype<TransactionsRange>(t.string)
export const unTransactionsRange =  iso<TransactionsRange>().unwrap
export const transactionsRange =  iso<TransactionsRange>().wrap

export type GETHeadersByRange = (contractId: ContractId,rangeOption: O.Option<TransactionsRange>) => TE.TaskEither<Error | DecodingError,GETByRangeResponse>

export const getHeadersByRangeViaAxios:(axiosInstance: AxiosInstance) => GETHeadersByRange
    = (axiosInstance) => (contractId,rangeOption) =>
        pipe( HTTP.GetWithDataAndHeaders
                  (axiosInstance)
                  (transactionsEndpoint(contractId)
                  ,pipe(rangeOption,O.match(() => ({}), range => ({ headers: { Range: unTransactionsRange(range) }}))))
            , TE.map(([headers,data]) =>
                ({ data:data
                 , previousRange: headers['prev-range']
                 , nextRange    : headers['next-range']}))
            , TE.chainW((data) => TE.fromEither(E.mapLeft(formatValidationErrors)(GETByRangeRawResponse.decode(data))))
            , TE.map((rawResponse) =>
                ({ headers: pipe(rawResponse.data.results,A.map((result) => result.resource))
                 , previousRange: rawResponse.previousRange
                 , nextRange    : rawResponse.nextRange})))

type GETByRangeRawResponse = t.TypeOf<typeof GETByRangeRawResponse>;
const GETByRangeRawResponse
    = t.type({ data : t.type({ results : t.array(t.type({ links   : t.type({ })
                                                        , resource: Header}))})
             , previousRange : optionFromNullable(TransactionsRange)
             , nextRange :optionFromNullable(TransactionsRange)
             });

export type GETByRangeResponse = t.TypeOf<typeof GETByRangeResponse>;
export const GETByRangeResponse
    = t.type({ headers : t.array(Header)
             , previousRange : optionFromNullable(TransactionsRange)
             , nextRange :optionFromNullable(TransactionsRange)
             });

export type TransactionTextEnvelope = t.TypeOf<typeof TransactionTextEnvelope>;
export const TransactionTextEnvelope = t.type({ contractId:ContractId, transactionId:TransactionId, tx : TextEnvelope})

export type POST = ( contractId:ContractId
                   , postTransactionsRequest: PostTransactionsRequest
                   , addressesAndCollaterals: AddressesAndCollaterals) => TE.TaskEither<Error | DecodingError ,TransactionTextEnvelope>


export const postViaAxios:(axiosInstance: AxiosInstance) => POST
  = (axiosInstance) => (contractId, postTransactionsRequest, addressesAndCollaterals) =>
      pipe( HTTP.Post (axiosInstance)
                      ( transactionsEndpoint(contractId)
                      , postTransactionsRequest
                      , { headers: {
                            'Accept': 'application/vendor.iog.marlowe-runtime.apply-inputs-tx-json',
                            'Content-Type':'application/json',
                            'X-Change-Address': unAddressBech32(addressesAndCollaterals.changeAddress),
                            'X-Address'         : pipe(addressesAndCollaterals.usedAddresses ,  A.fromOption, A.flatten, A.map (unAddressBech32) , (a) => a.join(',')),
                            'X-Collateral-UTxO': pipe(addressesAndCollaterals.collateralUTxOs, A.fromOption, A.flatten, A.map (unTxOutRef) , (a) => a.join(','))}})
          , TE.chainW((data) => TE.fromEither(E.mapLeft(formatValidationErrors)(PostResponse.decode(data))))
          , TE.map((payload) => payload.resource))

export type PostTransactionsRequest = t.TypeOf<typeof PostTransactionsRequest>
export const PostTransactionsRequest
    = t.intersection(
        [ t.type({ version: MarloweVersion
                 , inputs: t.array(Input)
                 , metadata: Metadata
                 , tags : Tags
                 })
        , t.partial({ invalidBefore: ISO8601})
        , t.partial({ invalidHereafter: ISO8601})
        ])

export type PostResponse = t.TypeOf<typeof PostResponse>;
export const PostResponse = t.type({
    links   : t.type({ transaction:t.string}),
    resource: TransactionTextEnvelope
    });

const transactionsEndpoint = (contractId: ContractId):string =>
    (`/contracts/${encodeURIComponent(unContractId(contractId))}/transactions`)