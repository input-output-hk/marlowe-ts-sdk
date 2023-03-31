import * as t from "io-ts";
import { Newtype, iso } from 'newtype-ts'
import * as E from 'fp-ts/Either'
import * as A from 'fp-ts/Array'
import * as O from 'fp-ts/lib/Option';
import * as TE from 'fp-ts/TaskEither'
import { formatValidationErrors } from "io-ts-reporters";
import { fromNewtype, optionFromNullable } from 'io-ts-types';
import { pipe } from 'fp-ts/lib/function';

import { AxiosInstance } from "axios";

import * as HTTP from '../../../../runtime/common/http';
import { unAddressBech32 } from "../../../../runtime/common/address";
import { Metadata } from "../../../../runtime/common/metadata";
import { WalletDetails } from "../../../../runtime/common/wallet";
import { DecodingError } from "../../../../runtime/common/codec";
import { TextEnvelope } from "../../../../runtime/common/textEnvelope";
import { MarloweVersion } from "../../../../runtime/common/version";
import { ISO8601 } from "../../../../runtime/common/iso8601";
import { Tags } from "../../../../runtime/common/metadata/tag";
import { Input } from "../../../../language/core/v1/semantics/contract/when/input";
import { Header } from "../header";
import { TransactionId } from ".././id";
import { ContractId, unContractId } from "../../id";

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
                   , walletDetails: WalletDetails) => TE.TaskEither<Error | DecodingError ,TransactionTextEnvelope>


export const postViaAxios:(axiosInstance: AxiosInstance) => POST
  = (axiosInstance) => (contractId, postTransactionsRequest, walletDetails) => 
      pipe( HTTP.Post (axiosInstance)
                      ( transactionsEndpoint(contractId)
                      , postTransactionsRequest
                      , { headers: {
                            'Accept': 'application/vendor.iog.marlowe-runtime.apply-inputs-tx-json',
                            'Content-Type':'application/json',
                            'X-Change-Address': unAddressBech32(walletDetails.changeAddress),
                            'X-Address'         : pipe(walletDetails.usedAddresses      , A.fromOption, A.flatten, (a) => a.join(',')),
                            'X-Collateral-UTxO': pipe(walletDetails.collateralUTxOs, A.fromOption, A.flatten, (a) => a.join(','))}})
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