import * as t from "io-ts/lib/index.js";

// TODO: We should delete this one as there is already a newtype in runtime-core
/**
 * @category Token
 */
export type PolicyId = string;
/**
 * @category Token
 */
export const PolicyId = t.string;
