export interface TokenMetadata {
  precision: number;
  symbol: string;
  name: string;
  network: "mainnet" | "preview" | "preprod";
}

export const lookupToken = (
  policyId: string,
  tokenName: string
): TokenMetadata => {
  if (policyId === "" && tokenName === "")
    return { precision: 1e-6, symbol: "₳", name: "Ada", network: "mainnet" };
  throw new Error("not found");
};
