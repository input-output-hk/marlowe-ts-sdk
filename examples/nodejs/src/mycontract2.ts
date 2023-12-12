import { lovelace } from "@marlowe.io/language-core-v1";
import * as G from "@marlowe.io/language-core-v1/guards";
import * as t from "io-ts/lib/index.js";

const GenericWhen = <
  W extends t.Mixed,
  T extends t.Mixed,
  TC extends t.Mixed
>(g: {
  whenG: W;
  timeoutG: T;
  timeoutContG: TC;
}) =>
  t.type({
    when: g.whenG,
    timeout: g.timeoutG,
    timeout_continuation: g.timeoutContG,
  });

const GenericCase = <C extends t.Mixed, T extends t.Mixed> (g: { caseG: C; thenG: T }) =>
  t.type({ case: g.caseG, then: g.thenG });

type WhenSingleCase = t.TypeOf<typeof WhenSingleCase>;
const WhenSingleCase = GenericWhen({
  whenG: t.tuple([GenericCase({ caseG: G.Deposit, thenG: t.unknown })]),
  timeoutG: t.bigint,
  timeoutContG: t.unknown,
});


const alice = { role_token: "alice" };
const contract1: unknown = {
  when: [],
  timeout: 20n,
  timeout_continuation: "close",
};
const contract2: unknown = {
  when: [
    {
      case: {
        party: alice,
        deposits: 10n,
        of_token: lovelace,
        into_account: alice,
      },
      then: "close",
    },
  ],
  timeout: 20n,
  timeout_continuation: "close",
};

[contract1, contract2].forEach((contract, ix) => {
  if (WhenSingleCase.is(contract)) {
    contract.timeout_continuation;
    console.log(`Contract ${ix} is a When with a single deposit`);
    console.log(`Deposit`, contract.when[0].case.deposits)
    // this fails at compile time
    // contract.when[1].case
  } else {
    console.log(`Contract ${ix} is not a When with a single deposit`);
  }
});


// const x = null as unknown as WhenSingleCase;
// x.when[0].case.deposits;
