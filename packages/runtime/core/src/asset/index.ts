import * as t from "io-ts/lib/index.js";
import { PolicyId, mkPolicyId, unPolicyId } from "../policyId.js";

import * as Marlowe from "@marlowe.io/language-core-v1";

export type AssetName = t.TypeOf<typeof AssetName>;
export const AssetName = t.string;

export type AssetQuantity = t.TypeOf<typeof AssetQuantity>;
export const AssetQuantity = t.bigint;

export type AssetId = t.TypeOf<typeof AssetId>;
export const AssetId = t.type({ policyId: PolicyId, assetName: AssetName });

export const assetId = (
  policyId: PolicyId
) => (assetName: AssetName): AssetId => ({
  policyId: policyId,
  assetName: assetName,
});

// NOTE: this is exported as interface to prevent typedoc from expanding its attributes when
//       generating documentation.
//       https://github.com/TypeStrong/typedoc/issues/2209#issuecomment-1493189988
export interface Token extends t.TypeOf<typeof Token> {}
export const Token = t.type({ quantity: AssetQuantity, assetId: AssetId });

export const token = (quantity: AssetQuantity) => (assetId: AssetId): Token =>
  ({ quantity: quantity, assetId: assetId });

export const lovelaces = (quantity: AssetQuantity): Token =>
  token(quantity)(assetId(mkPolicyId(""))(""));

export type Tokens = t.TypeOf<typeof Tokens>;
export const Tokens = t.array(Token);

export type Assets = t.TypeOf<typeof Assets>;
export const Assets = t.type({ lovelaces: AssetQuantity, tokens: Tokens });

export const assetIdToString: (assetId: AssetId) => string = (assetId) =>
  `${unPolicyId(assetId.policyId)}|${assetId.assetName}`;

export const runtimeTokenToMarloweTokenValue: (
  runtimeToken: Token
) => Marlowe.TokenValue = (runtimeToken) => ({
  amount: runtimeToken.quantity,
  token: {
    currency_symbol: unPolicyId(runtimeToken.assetId.policyId),
    token_name: runtimeToken.assetId.assetName,
  },
});
