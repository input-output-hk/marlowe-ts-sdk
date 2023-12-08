import * as t from "io-ts/lib/index.js";

// TODO: This should be replaced by a Branded Version available in the Runtime Rest Client Package,
export type AddressBech32 = string;
export const AddressBech32 = t.string;
