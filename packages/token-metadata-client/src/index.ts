export interface TokenMetadata {
  precision: number;
  symbol: string;
  name: string;
}

export const lookupToken = (
  policyId: string,
  tokenName: string
): TokenMetadata | Error => {
  if (policyId === "" && tokenName === "")
    return { precision: 1e-6, symbol: "₳", name: "Ada" };
  return new Error("not found");
};
