import * as t from "io-ts/lib/index.js";
import * as G from "@marlowe.io/language-core-v1/guards";
import * as E from "fp-ts/lib/Either.js";
import { pipe } from "fp-ts/lib/function.js";
import { formatValidationErrors } from "jsonbigint-io-ts-reporters";

import { BuiltinByteString, Contract } from "@marlowe.io/language-core-v1";
import { Bundle, Label } from "@marlowe.io/marlowe-object";
import { AxiosInstance } from "axios";

export interface CreateContractSourcesResponse {
  contractSourceId: BuiltinByteString;
  intermediateIds: {
    [key: Label]: BuiltinByteString;
  };
}

const CreateContractSourcesResponseGuard: t.Type<CreateContractSourcesResponse> =
  t.type({
    contractSourceId: G.BuiltinByteString,
    intermediateIds: t.record(t.string, G.BuiltinByteString),
  });

export const createContractSources = (axiosInstance: AxiosInstance) => {
  return async (
    main: Label,
    bundle: Bundle
  ): Promise<CreateContractSourcesResponse> => {
    const response = await axiosInstance.post("/contracts/sources", bundle, {
      params: { main },
    });
    return pipe(
      CreateContractSourcesResponseGuard.decode(response.data),
      E.match(
        (e) => {
          throw formatValidationErrors(e);
        },
        (v) => v
      )
    );
  };
};

export interface GetContractBySourceIdRequest {
  contractSourceId: BuiltinByteString;
  expand?: boolean;
}

export interface GetContractBySourceIdResponse {
  contract: Contract;
}

const GetContractBySourceIdResponseGuard: t.Type<GetContractBySourceIdResponse> =
  t.type({ contract: G.Contract });

export const getContractSourceById =
  (axiosInstance: AxiosInstance) =>
  async ({
    contractSourceId,
    expand,
  }: GetContractBySourceIdRequest): Promise<GetContractBySourceIdResponse> => {
    const response = await axiosInstance.get(
      `/contracts/sources/${encodeURIComponent(contractSourceId)}`,
      { params: { expand } }
    );
    return pipe(
      GetContractBySourceIdResponseGuard.decode(response.data),
      E.match(
        (e) => {
          throw formatValidationErrors(e);
        },
        (e) => e
      )
    );
  };

export interface GetContractSourceAdjacencyRequest {}

export interface GetContractSourceAdjacencyResponse {}

export interface GetContractSourceClosureRequest {}

export interface GetContractSourceClosureResponse {}
