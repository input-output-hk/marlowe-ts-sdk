import * as t from "io-ts/lib/index.js";
import * as G from "@marlowe.io/language-core-v1/guards";
import * as E from "fp-ts/lib/Either.js";
import { pipe } from "fp-ts/lib/function.js";
import { formatValidationErrors } from "jsonbigint-io-ts-reporters";

import { Contract } from "@marlowe.io/language-core-v1";
import {
  Label,
  ContractSourceId,
  ContractSourceIdGuard,
} from "@marlowe.io/marlowe-object";
import { BundleList } from "@marlowe.io/marlowe-object/bundle-list";
import { AxiosInstance } from "axios";

export interface CreateContractSourcesResponse {
  contractSourceId: ContractSourceId;
  intermediateIds: {
    [key: Label]: ContractSourceId;
  };
}

const CreateContractSourcesResponseGuard: t.Type<CreateContractSourcesResponse> =
  t.type({
    contractSourceId: ContractSourceIdGuard,
    intermediateIds: t.record(t.string, ContractSourceIdGuard),
  });

export const createContractSources = (axiosInstance: AxiosInstance) => {
  return async (
    main: Label,
    bundle: BundleList<undefined>
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
  contractSourceId: ContractSourceId;
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
  contractSourceId: ContractSourceId;
}

export interface GetContractSourceAdjacencyResponse {
  results: ContractSourceId[];
}

const GetContractSourceAdjacencyResponseGuard: t.Type<GetContractSourceAdjacencyResponse> =
  t.type({ results: t.array(ContractSourceIdGuard) });

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
  contractSourceId: ContractSourceId;
}

export interface GetContractSourceClosureResponse {
  results: ContractSourceId[];
}

const GetContractSourceClosureResponseGuard: t.Type<GetContractSourceClosureResponse> =
  t.type({ results: t.array(ContractSourceIdGuard) });

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
