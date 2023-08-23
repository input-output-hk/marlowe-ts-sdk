export interface TokenMetadata {
  precision: number;
  symbol: string;
  name: string;
  network: "mainnet" | "preview" | "preprod";
}

export const lookupTokenMetadata = (
  policyId: string,
  tokenName: string
): Promise<TokenMetadata> =>
  new Promise((resolve, reject) => {
    if (policyId === "" && tokenName === "")
      return resolve({
        precision: 1e-6,
        symbol: "₳",
        name: "Ada",
        network: "mainnet",
      });
    throw reject("not found");
  });

export const formatToken = (
  { precision, symbol }: TokenMetadata,
  value: number
): string => `${value * precision} ${symbol}`;
