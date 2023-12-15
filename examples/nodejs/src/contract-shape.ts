import { lovelace } from "@marlowe.io/language-core-v1";
import * as GC from "@marlowe.io/language-core-v1/guards";
import * as t from "io-ts/lib/index.js";
import * as G from "@marlowe.io/generic-guards";

// This is a shallow guard that only checks the provided structure. All missing
// properties are considered to be unknown.
const WhenSingleDeposit = G.When({
  when: t.tuple([G.NormalCase({ case: GC.Deposit })]),
});

// Three example contracts, only the second match the expected shape.
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
const contract3: unknown = {
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
    {
      case: {
        party: alice,
        deposits: 20n,
        of_token: lovelace,
        into_account: alice,
      },
      then: "close",
    },
  ],
  timeout: 20n,
  timeout_continuation: "close",
};

// This logs:
//   Contract 0 is not a When with a single deposit
//   Contract 1 is a When with a single deposit
//   Deposit 10n
//   Contract 2 is not a When with a single deposit
[contract1, contract2, contract3].forEach((contract, ix) => {
  if (WhenSingleDeposit.is(contract)) {
    contract.when[0].then; // unknown
    contract.when[0].case; // typed as Deposit
    // this fails at compile time, if
    // contract.when[1].case
    console.log(`Contract ${ix} is a When with a single deposit`);
    console.log(`Deposit`, contract.when[0].case.deposits);
  } else {
    console.log(`Contract ${ix} is not a When with a single deposit`);
  }
});
