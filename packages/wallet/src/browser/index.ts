import { CIP30Network, WalletAPI } from "../api.js";
import { C, Core } from "lucid-cardano";
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
  PolicyId,
} from "@marlowe.io/runtime-core";

export type SupportedWallet = "nami" | "eternl";

class BrowserWalletAPI implements WalletAPI {
  constructor(private extension: BroswerExtensionCIP30Api) {}

  // DISCUSSION: This can currently wait forever. Maybe we should add
  //             an abort controller or a timeout
  waitConfirmation(txHash: string, checkInterval = 3000) {
    const self = this;
    return new Promise<boolean>((txConfirm) => {
      const pollingId = setInterval(async () => {
        const utxos = await self.getUTxOs();
        const isConfirmed =
          utxos.filter((utxo) => unTxOutRef(utxo).split("#", 2)[0] == txHash)
            .length > 0;
        if (isConfirmed) {
          clearInterval(pollingId);
          // QUESTION @N.H: Why do we need to wait 1 second before returning true?
          await new Promise((res) => setTimeout(() => res(1), 1000));
          return txConfirm(true);
        }
      }, checkInterval);
    });
  }

  signTxTheCIP30Way(tx: string) {
    return this.extension.signTx(tx, true);
  }

  async getChangeAddress() {
    const changeAddress = await this.extension.getChangeAddress();
    return deserializeAddress(changeAddress);
  }

  async getUsedAddresses() {
    const usedAddresses = await this.extension.getUsedAddresses();
    return usedAddresses.map(deserializeAddress);
  }

  async getCollaterals() {
    const collaterals =
      (await this.extension.experimental.getCollateral()) ?? [];
    return collaterals.map(deserializeTxOutRef);
  }

  async getUTxOs() {
    const utxos = (await this.extension.getUtxos()) ?? [];
    return utxos.map(deserializeTxOutRef);
  }

  async getCIP30Network(): Promise<CIP30Network> {
    const networkId = await this.extension.getNetworkId();
    return networkId == 1 ? "Mainnet" : "Testnets";
  }

  async getTokens() {
    const balances = await this.extension.getBalance();
    return valueToTokens(deserializeValue(balances));
  }

  async getLovelaces(): Promise<bigint> {
    const balances = await this.extension.getBalance();
    return valueToLovelaces(deserializeValue(balances));
  }
}

/**
 * Returns an instance of the browser wallet API for the specified wallet.
 * @param walletName - The name of the wallet to get an instance of.
 * @returns An instance of the BrowserWalletAPI class.
 */
export async function createBrowserWallet(
  walletName: SupportedWallet
): Promise<WalletAPI> {
  if (getAvailableWallets().includes(walletName)) {
    const extension = await window.cardano[walletName.toLowerCase()].enable();
    return new BrowserWalletAPI(extension);
  } else {
    throw new Error(`Wallet ${walletName} is not available in the browser`);
  }
}

/**
 * Get a list of the available wallets installed in the browser
 */
export function getAvailableWallets(): SupportedWallet[] {
  if ("cardano" in window) {
    // NOTE: it would be nice to have a Type assertion that the supportedWallets array is
    // the same as the SupportedWallets type union. I've tried the other way (infering the type
    // from the array) but the exported documentation doesn't look good
    const supportedWallets = ["nami", "eternl"] as SupportedWallet[];
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
