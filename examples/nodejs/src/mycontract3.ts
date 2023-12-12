import { lovelace } from "@marlowe.io/language-core-v1";
import * as G from "@marlowe.io/language-core-v1/guards";
import * as t from "io-ts/lib/index.js";

const unk = <T extends t.Mixed = t.UnknownType>(g?: T): T =>
  g ?? (t.unknown as any as T);

const GenericWhen = <
  W extends t.Mixed = t.UnknownType,
  T extends t.Mixed = t.UnknownType,
  TC extends t.Mixed = t.UnknownType
>(
  g: Partial<{
    when: W;
    timeout: T;
    timeout_continuation: TC;
  }>
) =>
  t.type({
    when: unk(g.when),
    timeout: unk(g.timeout),
    timeout_continuation: unk(g.timeout_continuation),
  });

const GenericCase = <
  C extends t.Mixed = t.UnknownType,
  T extends t.Mixed = t.UnknownType
>(
  g: Partial<{
    case: C;
    then: T;
  }>
) => t.type({ case: unk(g.case), then: unk(g.then) });

type WhenSingleCase = t.TypeOf<typeof WhenSingleCase>;
const WhenSingleCase = GenericWhen({
  when: t.tuple([GenericCase({ case: G.Deposit })]),
  // timeout: t.bigint,
  // timeout_continuation: t.unknown,
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
    contract.when[0].then; // unknown
    console.log(`Contract ${ix} is a When with a single deposit`);
    console.log(`Deposit`, contract.when[0].case.deposits);
    // this fails at compile time
    // contract.when[1].case
  } else {
    console.log(`Contract ${ix} is not a When with a single deposit`);
  }
});

// const x = null as unknown as WhenSingleCase;
// x.when[0].case.deposits;
