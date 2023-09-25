import { pipe } from "fp-ts/lib/function.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import * as O from "fp-ts/lib/Option.js";

import { mkFPTSRestClient } from "@marlowe.io/runtime-rest-client/index.js";

import { getMarloweRuntimeUrl } from "../context.js";

import console from "console";
global.console = console;

describe("contracts endpoints", () => {
  const restClient = mkFPTSRestClient(getMarloweRuntimeUrl());

  it(
    "can navigate throught Initialised Marlowe Contracts pages" +
      "(GET:  /contracts/)",
    async () => {
      await pipe(
        restClient.contracts.getHeadersByRange(O.none)([]),
        TE.match(
          (e) => {
            console.dir(e, { depth: null });
            expect(e).not.toBeDefined();
          },
          (a) => {
            console.log("result", a.headers.length);
          }
        )
      )();
    }
  );
});
