import * as E from "fp-ts/lib/Either.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { pipe } from "fp-ts/lib/function.js";
import * as t from "io-ts/lib/index.js";

import { AxiosInstance } from "axios";

import { formatValidationErrors } from "jsonbigint-io-ts-reporters";

import * as HTTP from "@marlowe.io/adapter/http";
import { DecodingError } from "@marlowe.io/adapter/codec";

import {
  HexTransactionWitnessSet,
  TextEnvelope,
  transactionWitnessSetTextEnvelope,
} from "@marlowe.io/runtime-core";

import { ContractDetails, ContractDetailsGuard } from "../details.js";
import { ContractId } from "@marlowe.io/runtime-core";
import { unsafeEither, unsafeTaskEither } from "@marlowe.io/adapter/fp-ts";

export type GET = (
  contractId: ContractId
) => TE.TaskEither<Error | DecodingError, ContractDetails>;

type GETPayload = t.TypeOf<typeof GETPayload>;
const GETPayload = t.type({
  links: t.type({}),
  resource: ContractDetailsGuard,
});

/**
 * @see {@link https://docs.marlowe.iohk.io/api/get-contract-by-id}
 */
export const getContractById = async (
  axiosInstance: AxiosInstance,
  contractId: ContractId
): Promise<ContractDetails> => {
  const data = await unsafeTaskEither(
    HTTP.Get(axiosInstance)(contractEndpoint(contractId), {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    })
  );
  const payload = unsafeEither(
    E.mapLeft(formatValidationErrors)(GETPayload.decode(data))
  );
  return payload.resource;
};

export type PUT = (
  contractId: ContractId,
  hexTransactionWitnessSet: HexTransactionWitnessSet
) => TE.TaskEither<Error, void>;

export const submitContractViaAxios =
  (axiosInstance: AxiosInstance) =>
  (contractId: ContractId, envelope: TextEnvelope) =>
    axiosInstance
      .put(contractEndpoint(contractId), envelope, {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      })
      .then((_) => {
        return;
      });
/**
 * @deprecated
 * @see {@link https://docs.marlowe.iohk.io/api/create-contracts-by-id}
 */
export const putViaAxios: (axiosInstance: AxiosInstance) => PUT =
  (axiosInstance) => (contractId, hexTransactionWitnessSet) =>
    pipe(
      HTTP.Put(axiosInstance)(
        contractEndpoint(contractId),
        transactionWitnessSetTextEnvelope(hexTransactionWitnessSet),
        {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        }
      )
    );

const contractEndpoint = (contractId: ContractId): string =>
  `/contracts/${encodeURIComponent(contractId)}`;
