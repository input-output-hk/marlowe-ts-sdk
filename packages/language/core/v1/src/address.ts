import * as t from "io-ts/lib/index.js";

// TODO: This should be DELETED as there is a newtype for this in runtime-core,
//       but a preliminary change broke the build with weird type errors
export type AddressBech32 = string;
export const AddressBech32 = t.string;
