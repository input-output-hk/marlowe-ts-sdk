

import { Contract, lovelace } from "@marlowe.io/language-core-v1"
import * as G from "@marlowe.io/language-core-v1/guards"
import * as t from "io-ts/lib/index.js";

const UnkWhen = t.type({ when: t.array(t.unknown), timeout: t.bigint, timeout_continuation: t.unknown })
type UnkWhen = t.TypeOf<typeof UnkWhen>
const UnkCase = t.type({ case: t.unknown, then: t.unknown })

interface WhenSingleCaseBrand {
  readonly WhenSingleCase: unique symbol
}
type WhenSingleCase = t.TypeOf<typeof WhenSingleCase>
const WhenSingleCase = t.brand(UnkWhen, (x): x is t.Branded<UnkWhen, WhenSingleCaseBrand> => x.when.length == 1 && UnkCase.is(x.when[0]), "WhenSingleCase")


const WhenSingleCase2 = t.refinement(UnkWhen, x => x.when.length == 1 && UnkCase.is(x.when[0]), "WhenSingleCase2")
type WhenSingleCase2 = t.TypeOf<typeof WhenSingleCase2>
const x = null as unknown as WhenSingleCase;
x.when
const y = null as unknown as WhenSingleCase2;
y.when

const WhenSingleCase3 = UnkWhen.pipe(WhenSingleCase2);
type WhenSingleCase3 = t.TypeOf<typeof WhenSingleCase3>
const z = null as unknown as WhenSingleCase3;
z.when

const alice = { role_token: "alice" };
const contract1: unknown = {
  when: [],
  timeout: 20n,
  timeout_continuation: "close"
}
const contract2: unknown = {
  when: [
    {case: { party: alice, deposits: 10n, of_token: lovelace, into_account: alice }
    , then: "close"
    }
  ],
  timeout: 20n,
  timeout_continuation: "close"
};

[contract1, contract2].forEach((contract, ix) => {
  if (WhenSingleCase.is(contract)) {
    contract.timeout_continuation
    console.log(`Contract ${ix} is a When with a single deposit`);

    // const w = contract.when[0].case;
    // console.log(contract.when[0].case.amount)
  }

});

// if (G.When.is(contract)) {
//   console.log("Contract is a When")
// } else {
//   console.log("Contract is not a When")
// }

// if (WhenWithCloseTimeout.is(contract)) {
//   console.log("Contract is a When with a close for timeout continuation")
// } else {
//   console.log("Contract is NOT a When with a close for timeout continuation")
// }
