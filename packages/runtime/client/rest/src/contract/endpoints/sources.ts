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

export type GetContractBySourceIdResponse = Contract;

const GetContractBySourceIdResponseGuard: t.Type<GetContractBySourceIdResponse> =
  G.Contract;

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

export interface GetContractSourceAdjacencyRequest {
  contractSourceId: BuiltinByteString;
}

export interface GetContractSourceAdjacencyResponse {
  results: BuiltinByteString[];
}

const GetContractSourceAdjacencyResponseGuard: t.Type<GetContractSourceAdjacencyResponse> =
  t.type({ results: t.array(G.BuiltinByteString) });

export const getContractSourceAdjacency =
  (axiosInstance: AxiosInstance) =>
  async ({
    contractSourceId,
  }: GetContractSourceAdjacencyRequest): Promise<GetContractSourceAdjacencyResponse> => {
    const response = await axiosInstance.get(
      `/contracts/sources/${encodeURIComponent(contractSourceId)}/adjacency`
    );
    return pipe(
      GetContractSourceAdjacencyResponseGuard.decode(response.data),
      E.match(
        (e) => {
          throw formatValidationErrors(e);
        },
        (e) => e
      )
    );
  };

export interface GetContractSourceClosureRequest {
  contractSourceId: BuiltinByteString;
}

export interface GetContractSourceClosureResponse {
  results: BuiltinByteString[];
}

const GetContractSourceClosureResponseGuard: t.Type<GetContractSourceClosureResponse> =
  t.type({ results: t.array(G.BuiltinByteString) });

export const getContractSourceClosure =
  (axiosInstance: AxiosInstance) =>
  async ({
    contractSourceId,
  }: GetContractSourceClosureRequest): Promise<GetContractSourceClosureResponse> => {
    const response = await axiosInstance.get(
      `/contracts/sources/${encodeURIComponent(contractSourceId)}/closure`
    );
    return pipe(
      GetContractSourceClosureResponseGuard.decode(response.data),
      E.match(
        (e) => {
          throw formatValidationErrors(e);
        },
        (e) => e
      )
    );
  };
