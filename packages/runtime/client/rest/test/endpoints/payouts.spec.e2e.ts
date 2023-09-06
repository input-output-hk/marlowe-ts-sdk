import { pipe } from "fp-ts/lib/function.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import * as O from "fp-ts/lib/Option.js";

import { mkRestClient } from "@marlowe.io/runtime-rest-client/index.js";

import { getMarloweRuntimeUrl } from "../context.js";

import console from "console";
global.console = console;

describe("payouts endpoints", () => {
  const restClient = mkRestClient(getMarloweRuntimeUrl());

  it("can navigate throught payout headers" + "(GET:  /payouts)", async () => {
    await pipe(
      restClient.payouts.getHeadersByRange(O.none)([])([])(O.none),
      TE.match(
        (e) => {
          console.dir(e, { depth: null });
          expect(e).not.toBeDefined();
        },
        (a) => {
          console.log("#payout headers read :", a.headers.length);
        }
      )
    )();
  }),
    it(
      "can navigate throught payout headers filtering by available payouts" +
        "(GET:  /payouts)",
      async () => {
        await pipe(
          restClient.payouts.getHeadersByRange(O.none)([])([])(
            O.some("available")
          ),
          TE.match(
            (e) => {
              console.dir(e, { depth: null });
              expect(e).not.toBeDefined();
            },
            (a) => {
              console.log("#payout headers read :", a.headers.length);
            }
          )
        )();
      }
    ),
    it(
      "can navigate throught payout headers filtering by withdrawn payouts" +
        "(GET:  /payouts)",
      async () => {
        await pipe(
          restClient.payouts.getHeadersByRange(O.none)([])([])(
            O.some("withdrawn")
          ),
          TE.match(
            (e) => {
              console.dir(e, { depth: null });
              expect(e).not.toBeDefined();
            },
            (a) => {
              console.log("#payout headers read :", a.headers.length);
              expect(a.headers.map((header) => header.status)).toContain(
                "withdrawn"
              );
              expect(a.headers.map((header) => header.status)).not.toContain(
                "available"
              );
            }
          )
        )();
      }
    ),
    it(
      "can navigate throught payout headers filtering by contractId " +
        "(GET:  /payouts)",
      async () => {
        await pipe(
          restClient.payouts.getHeadersByRange(O.none)([])([])(O.none),
          TE.map((result) => result.headers.map((header) => header.contractId)),
          TE.chain((contracIds) =>
            restClient.payouts.getHeadersByRange(O.none)(contracIds)([])(O.none)
          ),
          TE.match(
            (e) => {
              console.dir(e, { depth: null });
              expect(e).not.toBeDefined();
            },
            (a) => {
              console.log("#payout headers read :", a.headers.length);
            }
          )
        )();
      }
    ),
    it(
      "can navigate throught payout headers filtering by role tokens " +
        "(GET:  /payouts)",
      async () => {
        await pipe(
          restClient.payouts.getHeadersByRange(O.none)([])([])(O.none),
          TE.map((result) => result.headers.map((header) => header.role)),
          TE.chain((roles) =>
            restClient.payouts.getHeadersByRange(O.none)([])(roles)(O.none)
          ),
          TE.match(
            (e) => {
              console.dir(e, { depth: null });
              expect(e).not.toBeDefined();
            },
            (a) => {
              console.log("#payout headers read :", a.headers.length);
            }
          )
        )();
      }
    ),
    it(
      "can navigate throught payout details" + "(GET:  /payouts/{payoutId})",
      async () => {
        await pipe(
          restClient.payouts.getHeadersByRange(O.none)([])([])(O.none),
          TE.chain((result) =>
            TE.sequenceArray(
              result.headers.map((header) =>
                restClient.payouts.get(header.payoutId)
              )
            )
          ),
          TE.match(
            (e) => {
              console.dir(e, { depth: null });
              expect(e).not.toBeDefined();
            },
            (a) => {
              console.log("#payout details read", a.length);
            }
          )
        )();
      },
      100_000
    );
});
