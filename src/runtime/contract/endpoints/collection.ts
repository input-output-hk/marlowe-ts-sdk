
import { AxiosInstance } from 'axios';

import * as TE from 'fp-ts/TaskEither'
import { pipe } from 'fp-ts/lib/function';
import { Newtype, iso } from 'newtype-ts'
import * as HTTP from '../../../runtime/common/http';
import { Header } from '../header';

import { RolesConfig } from '../role';

import { Metadata, Tags } from '../../../runtime/common/metadata';

import { TextEnvelope } from '../../../runtime/common/textEnvelope';
import { ContractId } from '../id';
import * as t from "io-ts";
import { formatValidationErrors } from 'io-ts-reporters'
import { DecodingError } from '../../../runtime/common/codec';
import * as E from 'fp-ts/Either'
import * as A from 'fp-ts/Array'
import { MarloweVersion } from '../../../runtime/common/version';
import { unAddressBech32 } from '../../../runtime/common/address';

import { fromNewtype, optionFromNullable } from 'io-ts-types';
import * as O from 'fp-ts/lib/Option';
import { Contract } from '../../../language/core/v1/semantics/contract';
import { WalletDetails } from '../../../runtime/common/wallet';


export interface ContractsRange extends Newtype<{ readonly ContractsRange: unique symbol }, string> {}
export const ContractsRange = fromNewtype<ContractsRange>(t.string)
export const unContractsRange =  iso<ContractsRange>().unwrap
export const contractsRange =  iso<ContractsRange>().wrap

export type GETHeadersByRange = (rangeOption: O.Option<ContractsRange>) => TE.TaskEither<Error | DecodingError,GETByRangeResponse>

export const getHeadersByRangeViaAxios:(axiosInstance: AxiosInstance) => GETHeadersByRange
    = (axiosInstance) => (rangeOption) => 
        pipe( HTTP.GetWithDataAndHeaders(axiosInstance)( '/contracts',pipe(rangeOption,O.match(() => ({}), range => ({ headers: { Range: unContractsRange(range) }}))))
            , TE.map(([headers,data]) =>  
                ({ data:data
                 , previousRange: headers['prev-range']
                 , nextRange    : headers['next-range']}))
            , TE.chainW((data) => TE.fromEither(E.mapLeft(formatValidationErrors)(GETByRangeRawResponse.decode(data))))
            , TE.map(rawResponse =>  
                ({ headers: pipe(rawResponse.data.results,A.map((result) => result.resource))
                 , previousRange: rawResponse.previousRange
                 , nextRange    : rawResponse.nextRange})))

type GETByRangeRawResponse = t.TypeOf<typeof GETByRangeRawResponse>;
const GETByRangeRawResponse 
    = t.type({ data : t.type({ results : t.array(t.type({ links   : t.type({ contract:t.string, transactions:t.string})
                                , resource: Header}))})
             , previousRange : optionFromNullable(ContractsRange)
             , nextRange :optionFromNullable(ContractsRange)
             });

export type GETByRangeResponse = t.TypeOf<typeof GETByRangeResponse>;
export const GETByRangeResponse 
    = t.type({ headers : t.array(Header)
             , previousRange : optionFromNullable(ContractsRange)
             , nextRange :optionFromNullable(ContractsRange)
             });

export type POST = ( postContractsRequest: PostContractsRequest
                   , walletDetails: WalletDetails) => TE.TaskEither<Error | DecodingError ,ContractTextEnvelope>

export type PostContractsRequest = t.TypeOf<typeof PostContractsRequest>
export const PostContractsRequest 
    = t.intersection(
        [ t.type({ contract: Contract
                , version: MarloweVersion
                , tags : Tags
                , metadata: Metadata
                , minUTxODeposit: t.number})
        , t.partial({roles: RolesConfig})
        ])


export type ContractTextEnvelope = t.TypeOf<typeof ContractTextEnvelope>;
export const ContractTextEnvelope = t.type({ contractId:ContractId, tx : TextEnvelope})

export type PostResponse = t.TypeOf<typeof PostResponse>;
export const PostResponse = t.type({
    links   : t.type({ contract:t.string}),
    resource: ContractTextEnvelope
    });

export const postViaAxios:(axiosInstance: AxiosInstance) => POST
    = (axiosInstance) => (postContractsRequest, walletDetails) => 
        pipe( HTTP.Post (axiosInstance)
                        ( '/contracts'
                        , postContractsRequest
                        , { headers: {  'Accept': 'application/vendor.iog.marlowe-runtime.contract-tx-json',
                                        'Content-Type':'application/json',
                                        'X-Change-Address': unAddressBech32(walletDetails.changeAddress),
                                        'X-Address'         : pipe(walletDetails.usedAddresses      , A.fromOption, A.flatten, (a) => a.join(',')),
                                        'X-Collateral-UTxO': pipe(walletDetails.collateralUTxOs, A.fromOption, A.flatten, (a) => a.join(','))}})
            , TE.chainW((data) => TE.fromEither(E.mapLeft(formatValidationErrors)(PostResponse.decode(data))))
            , TE.map((payload) => payload.resource))
                                        




