
/* eslint-disable sort-keys-fix/sort-keys-fix */
/* eslint-disable no-use-before-define */
import axios from 'axios';
import { AxiosInstance, AxiosResponse } from 'axios';
import * as TE from 'fp-ts/TaskEither'
import { flow, identity } from 'fp-ts/lib/function';
import { JsonAlwayAndOnlyBigInt } from '../../adapter/json';


const getOnlyData = TE.bimap(
  (e: unknown) => (e instanceof Error ? e : new Error(JsonAlwayAndOnlyBigInt.stringify(e))),
  (v: AxiosResponse): any => v.data,
);

const getWithDataAndHeaders = TE.bimap(
  (e: unknown) => (e instanceof Error ? e : new Error(String(e))),
  (v: AxiosResponse): any => [v.headers,v.data],
);

export const Get = (request: AxiosInstance) => flow(TE.tryCatchK(request.get, identity), getOnlyData);

export const GetWithDataAndHeaders = (request: AxiosInstance) => flow(TE.tryCatchK(request.get, identity), getWithDataAndHeaders);

export const Post  = (request: AxiosInstance) => flow(TE.tryCatchK(request.post, identity), getOnlyData);

export const Put  = (request: AxiosInstance) => flow(TE.tryCatchK(request.put, identity), getOnlyData);