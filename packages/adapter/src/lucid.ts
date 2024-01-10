import { Monoid } from "fp-ts/lib/Monoid.js";

import * as R from "fp-ts/lib/Record.js";

export type LucidAssets = {
  [x: string]: bigint;
};

// Function that tells how to join two assets
const addAssets = { concat: (x: bigint, y: bigint) => x + y };

// A monoid for Lucid's Assets indicates how to create
// an empty Assets object and how to merge two Assets objects.
export const mergeAssets: Monoid<LucidAssets> = {
  // Lucid's Assets object are a Record<string, bigint>,
  // so the empty assets is the empty object
  empty: {},
  // And to join two assets we join the two records. When
  // the "assetId" is the same, the quantities are added.
  concat: (x, y) => R.union(addAssets)(x)(y),
};
