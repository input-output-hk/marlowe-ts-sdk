import * as t from "io-ts/lib/index.js";
import * as G from "@marlowe.io/language-core-v1/guards";
import * as E from "fp-ts/lib/Either.js";
import { pipe } from "fp-ts/lib/function.js";
import { formatValidationErrors } from "jsonbigint-io-ts-reporters";

import { BuiltinByteString } from "@marlowe.io/language-core-v1";
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
