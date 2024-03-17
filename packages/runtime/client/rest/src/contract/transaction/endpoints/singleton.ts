import * as TE from "fp-ts/lib/TaskEither.js";
import * as E from "fp-ts/lib/Either.js";
import { pipe } from "fp-ts/lib/function.js";
import * as t from "io-ts/lib/index.js";

import { AxiosInstance } from "axios";
import { formatValidationErrors } from "jsonbigint-io-ts-reporters";

import * as HTTP from "@marlowe.io/adapter/http";
import { DecodingError } from "@marlowe.io/adapter/codec";

import {
  ContractIdGuard,
  HexTransactionWitnessSet,
  HexTransactionWitnessSetGuard,
  TxId,
  TxIdGuard,
  transactionWitnessSetTextEnvelope,
} from "@marlowe.io/runtime-core";

import { TransactionDetailsGuard, TransactionDetails } from "../details.js";
import { ContractId } from "@marlowe.io/runtime-core";
import { assertGuardEqual, proxy } from "@marlowe.io/adapter/io-ts";

export type GET = (
  contractId: ContractId,
  transactionId: TxId
) => TE.TaskEither<Error | DecodingError, TransactionDetails>;

type GETPayload = t.TypeOf<typeof GETPayload>;
const GETPayload = t.type({
  links: t.type({}),
  resource: TransactionDetailsGuard,
});

/**
 * Request options for the {@link index.RestClient#getContractTransactionById | Get contract transaction by ID } endpoint
 * @category Endpoint : Get contract transaction by ID
 */
export interface GetContractTransactionByIdRequest {
  contractId: ContractId;
  txId: TxId;
}

export const GetContractTransactionByIdRequestGuard = assertGuardEqual(
  proxy<GetContractTransactionByIdRequest>(),
  t.type({
    contractId: ContractIdGuard,
    txId: TxIdGuard,
  })
);

export const getViaAxios: (axiosInstance: AxiosInstance) => GET = (axiosInstance) => (contractId, transactionId) =>
  pipe(
    HTTP.Get(axiosInstance)(endpointURI(contractId, transactionId), {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    }),
    TE.chainW((data) => TE.fromEither(E.mapLeft(formatValidationErrors)(GETPayload.decode(data)))),
    TE.map((payload) => payload.resource)
  );

/**
 * Request options for the {@link index.RestClient#submitContractTransaction | Submit contract transaction } endpoint
 * @category Endpoint : Submit contract transaction
 */
export interface SubmitContractTransactionRequest {
  contractId: ContractId;
  transactionId: TxId;
  hexTransactionWitnessSet: HexTransactionWitnessSet;
}

export const SubmitContractTransactionRequestGuard = assertGuardEqual(
  proxy<SubmitContractTransactionRequest>(),
  t.type({
    contractId: ContractIdGuard,
    transactionId: TxIdGuard,
    hexTransactionWitnessSet: HexTransactionWitnessSetGuard,
  })
);

export type PUT = (
  contractId: ContractId,
  transactionId: TxId,
  hexTransactionWitnessSet: HexTransactionWitnessSet
) => TE.TaskEither<Error, void>;

export const putViaAxios: (axiosInstance: AxiosInstance) => PUT =
  (axiosInstance) => (contractId, transactionId, hexTransactionWitnessSet) =>
    pipe(
      HTTP.Put(axiosInstance)(
        endpointURI(contractId, transactionId),
        transactionWitnessSetTextEnvelope(hexTransactionWitnessSet),
        {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        }
      )
    );

const endpointURI = (contractId: ContractId, transactionId: TxId): string =>
  `/contracts/${pipe(contractId, encodeURIComponent)}/transactions/${pipe(transactionId, encodeURIComponent)}`;
