import { WalletAPI } from "../api.js";
import { C, Core, WalletApi } from "lucid-cardano";
import { hex, utf8 } from "@47ng/codec";
// DISCUSSION: these should be imported from a cardano helpers library.
//       They are independent of the runtime. Maybe the adaptor library?
import {
  AddressBech32,
  TxOutRef,
  addressBech32,
  txOutRef,
  Token,
  token,
  lovelaces,
  assetId,
  mkPolicyId,
  unTxOutRef,
} from "@marlowe.io/runtime-core";

export type SupportedWallet = "nami" | "eternl" | "lace";

export type ExtensionDI = { extension: WalletApi };

/**
 * Returns an instance of the browser wallet API for the specified wallet.
 * @param walletName - The name of the wallet to get an instance of.
 * @returns An instance of the BrowserWalletAPI class.
 */
export async function mkBrowserWallet(
  walletName: SupportedWallet
): Promise<WalletAPI> {
  if (getAvailableWallets().includes(walletName)) {
    const extension = await window.cardano[walletName.toLowerCase()].enable();
    const di = { extension };
    return {
      waitConfirmation: waitConfirmation(di),
      signTx: signTx(di),
      getChangeAddress: getChangeAddress(di),
      getUsedAddresses: getUsedAddresses(di),
      getCollaterals: getCollaterals(di),
      getUTxOs: getUTxOs(di),
      isMainnet: isMainnet(di),
      getTokens: getTokens(di),
      getLovelaces: getLovelaces(di),
    };
  } else {
    throw new Error(`Wallet ${walletName} is not available in the browser`);
  }
}

// DISCUSSION: This can currently wait forever. Maybe we should add
//             an abort controller or a timeout
const waitConfirmation =
  (di: ExtensionDI) =>
  (txHash: string, checkInterval = 3000) => {
    return new Promise<boolean>((txConfirm) => {
      const pollingId = setInterval(async () => {
        const utxos = await getUTxOs(di)();
        const isConfirmed =
          utxos.filter((utxo) => unTxOutRef(utxo).split("#", 2)[0] == txHash)
            .length > 0;
        if (isConfirmed) {
          clearInterval(pollingId);
          return txConfirm(true);
        }
      }, checkInterval);
    });
  };

const signTx =
  ({ extension }: ExtensionDI) =>
  (tx: string) => {
    return extension.signTx(tx, true);
  };

const getChangeAddress =
  ({ extension }: ExtensionDI) =>
  async () => {
    const changeAddress = await extension.getChangeAddress();
    return deserializeAddress(changeAddress);
  };

const getUsedAddresses =
  ({ extension }: ExtensionDI) =>
  async () => {
    const usedAddresses = await extension.getUsedAddresses();
    return usedAddresses.map(deserializeAddress);
  };

const getUTxOs =
  ({ extension }: ExtensionDI) =>
  async () => {
    const utxos = (await extension.getUtxos()) ?? [];
    return utxos.map(deserializeTxOutRef);
  };

const getCollaterals =
  ({ extension }: ExtensionDI) =>
  async () => {
    const collaterals = (await extension.experimental.getCollateral()) ?? [];
    return collaterals.map(deserializeTxOutRef);
  };

const isMainnet =
  ({ extension }: ExtensionDI) =>
  async () => {
    const networkId = await extension.getNetworkId();
    return networkId == 1;
  };

const getTokens =
  ({ extension }: ExtensionDI) =>
  async () => {
    const balances = await extension.getBalance();
    return valueToTokens(deserializeValue(balances));
  };

const getLovelaces =
  ({ extension }: ExtensionDI) =>
  async () => {
    const balances = await extension.getBalance();
    return valueToLovelaces(deserializeValue(balances));
  };

/**
 * Get a list of the available wallets installed in the browser
 */
export function getAvailableWallets(): SupportedWallet[] {
  if ("cardano" in window) {
    // NOTE: it would be nice to have a Type assertion that the supportedWallets array is
    // the same as the SupportedWallets type union. I've tried the other way (infering the type
    // from the array) but the exported documentation doesn't look good
    const supportedWallets = ["nami", "eternl", "lace"] as SupportedWallet[];
    return supportedWallets.filter((wallet) => wallet in window.cardano);
  } else {
    return [];
  }
}

function deserializeAddress(addressHex: string): AddressBech32 {
  return addressBech32(
    C.Address.from_bytes(hex.decode(addressHex)).to_bech32(undefined)
  );
}

function deserializeTxOutRef(utxoStr: string): TxOutRef {
  const utxo = C.TransactionUnspentOutput.from_bytes(hex.decode(utxoStr));
  const input = JSON.parse(utxo.input().to_json());
  return txOutRef(input.transaction_id + "#" + input.index);
}

type DataSignature = {
  signature: string;
  key: string;
};

type BroswerExtensionCIP30Api = {
  experimental: ExperimentalFeatures;
  getBalance(): Promise<string>;
  getChangeAddress(): Promise<string>;
  getNetworkId(): Promise<number>;
  getRewardAddresses(): Promise<string[]>;
  getUnusedAddresses(): Promise<string[]>;
  getUsedAddresses(): Promise<string[]>;
  getUtxos(): Promise<string[] | undefined>;
  signData(address: string, payload: string): Promise<DataSignature>;
  signTx(tx: string, partialSign: boolean): Promise<string>;
  submitTx(tx: string): Promise<string>;
};

type ExperimentalFeatures = {
  getCollateral(): Promise<string[] | undefined>;
};

const deserializeValue = (value: string) =>
  C.Value.from_bytes(hex.decode(value));

const valueToTokens = (value: Core.Value) => {
  const tokenValues: Token[] = [lovelaces(valueToLovelaces(value))];

  const multiAsset = value.multiasset();
  if (multiAsset !== undefined) {
    const policies = multiAsset.keys();
    for (let i = 0; i < policies.len(); i += 1) {
      const policyId = policies.get(i);
      const policyAssets = multiAsset.get(policyId);
      if (policyAssets !== undefined) {
        const policyAssetNames = policyAssets.keys();
        for (let j = 0; j < policyAssetNames.len(); j += 1) {
          const assetName = policyAssetNames.get(j);
          const quantity =
            policyAssets.get(assetName) ?? C.BigNum.from_str("0");
          tokenValues.push(
            token(BigInt(quantity.to_str()).valueOf())(
              assetId(mkPolicyId(policyId.to_hex()))(
                utf8.decode(assetName.to_bytes()).substring(1) // N.H : investigate why 1 aditional character is returned
              )
            )
          );
        }
      }
    }
  }

  return tokenValues;
};

const valueToLovelaces = (value: Core.Value) =>
  BigInt(value.coin().to_str()).valueOf();
