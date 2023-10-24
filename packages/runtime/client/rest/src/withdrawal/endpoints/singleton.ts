/* eslint-disable sort-keys-fix/sort-keys-fix */
/* eslint-disable no-use-before-define */
import { AxiosInstance } from "axios";
import * as E from "fp-ts/lib/Either.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { pipe } from "fp-ts/lib/function.js";
import * as HTTP from "@marlowe.io/adapter/http";

import { formatValidationErrors } from "jsonbigint-io-ts-reporters";

import { WithdrawalDetails } from "../details.js";
import { DecodingError } from "@marlowe.io/adapter/codec";
import {
  BlockHeader,
  HexTransactionWitnessSet,
  WithdrawalId,
  transactionWitnessSetTextEnvelope,
  unWithdrawalId,
} from "@marlowe.io/runtime-core";
import { TxStatus } from "../../contract/transaction/status.js";
import { PayoutHeader } from "../../payout/header.js";

export type GET = (
  withdrawalId: WithdrawalId
) => TE.TaskEither<Error | DecodingError, WithdrawalDetails>;

export type GetWithdrawalByIdResponse = {
  withdrawalId: WithdrawalId;
  status: TxStatus;
  block?: BlockHeader;
  payouts: PayoutHeader[];
};

/**
 * @see {@link https://docs.marlowe.iohk.io/api/get-withdrawal-by-id}
 */
export const getViaAxios: (axiosInstance: AxiosInstance) => GET =
  (axiosInstance) => (withdrawalId) =>
    pipe(
      HTTP.Get(axiosInstance)(endpointURI(withdrawalId), {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      }),
      TE.chainW((data) =>
        TE.fromEither(
          E.mapLeft(formatValidationErrors)(WithdrawalDetails.decode(data))
        )
      )
    );

export type PUT = (
  withdrawalId: WithdrawalId,
  hexTransactionWitnessSet: HexTransactionWitnessSet
) => TE.TaskEither<Error, void>;

/**
 * @see {@link https://docs.marlowe.iohk.io/api/create-withdrawal}
 */
export const putViaAxios: (axiosInstance: AxiosInstance) => PUT =
  (axiosInstance) => (withdrawalId, hexTransactionWitnessSet) =>
    pipe(
      HTTP.Put(axiosInstance)(
        endpointURI(withdrawalId),
        transactionWitnessSetTextEnvelope(hexTransactionWitnessSet),
        {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        }
      )
    );

const endpointURI = (withdrawalId: WithdrawalId): string =>
  `/withdrawals/${encodeURIComponent(unWithdrawalId(withdrawalId))}`;
