import * as T from "fp-ts/lib/Task.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { pipe } from "fp-ts/lib/function.js";
import * as A from "fp-ts/lib/Array.js";

import { WalletAPI } from "../api.js";
import { C, Core } from "lucid-cardano";
import { hex, utf8 } from "@47ng/codec";
import {
  MarloweTxCBORHex,
  HexTransactionWitnessSet,
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

export const getExtensionInstance: (
  extensionName: string
) => T.Task<WalletAPI> = (extensionName) =>
  pipe(
    () => window.cardano[extensionName.toLowerCase()].enable(),
    T.map((extensionCIP30Instance) => ({
      waitConfirmation: waitConfirmation(extensionCIP30Instance),
      signTxTheCIP30Way: signMarloweTx(extensionCIP30Instance),
      getChangeAddress: fetchChangeAddress(extensionCIP30Instance),
      getUsedAddresses: fetchUsedAddresses(extensionCIP30Instance),
      getCollaterals: fetchCollaterals(extensionCIP30Instance),
      getUTxOs: fetchUTxOs(extensionCIP30Instance),
      getTokens: fetchTokens(extensionCIP30Instance),
      getLovelaces: fetchLovelaces(extensionCIP30Instance),
      getCIP30Network: fetchCIP30Network(extensionCIP30Instance),
    }))
  );

const waitConfirmation: (
  extensionCIP30Instance: BroswerExtensionCIP30Api
) => (txHash: string) => TE.TaskEither<Error, boolean> =
  (extensionCIP30Instance) => (txHash) =>
    pipe(() => awaitTx(extensionCIP30Instance, txHash), TE.fromTask);

function awaitTx(
  extensionCIP30Instance: BroswerExtensionCIP30Api,
  txHash: string,
  checkInterval: number = 3000
): Promise<boolean> {
  return new Promise((res) => {
    const confirmation = setInterval(async () => {
      const isConfirmed =
        (await fetchUTxOs(extensionCIP30Instance)()).filter(
          (txOutRef) => unTxOutRef(txOutRef).split("#", 2)[0] == txHash
        ).length > 0;
      if (isConfirmed) {
        clearInterval(confirmation);
        await new Promise((res) => setTimeout(() => res(1), 1000));
        return res(true);
      }
    }, checkInterval);
  });
}

const signMarloweTx: (
  extensionCIP30Instance: BroswerExtensionCIP30Api
) => (
  cborHex: MarloweTxCBORHex
) => TE.TaskEither<Error, HexTransactionWitnessSet> =
  (extensionCIP30Instance) => (cborHex) =>
    pipe(() => extensionCIP30Instance.signTx(cborHex, true), TE.fromTask);

const fetchChangeAddress: (
  extensionCIP30Instance: BroswerExtensionCIP30Api
) => T.Task<AddressBech32> = (extensionCIP30Instance) =>
  pipe(
    T.Do,
    T.bind("changeAddress", () =>
      pipe(() => extensionCIP30Instance.getChangeAddress())
    ),
    T.map(({ changeAddress }) => deserializeAddress(changeAddress))
  );

const fetchUsedAddresses: (
  extensionCIP30Instance: BroswerExtensionCIP30Api
) => T.Task<AddressBech32[]> = (extensionCIP30Instance) =>
  pipe(
    T.Do,
    T.bind("usedAddresses", () =>
      pipe(() => extensionCIP30Instance.getUsedAddresses())
    ),
    T.map(({ usedAddresses }) => pipe(usedAddresses, A.map(deserializeAddress)))
  );

const fetchCIP30Network = (extensionCIP30Instance: BroswerExtensionCIP30Api) =>
  async function () {
    const networkId = await extensionCIP30Instance.getNetworkId();
    return networkId == 1 ? "Mainnet" : "Testnets";
  };

const fetchUTxOs: (
  extensionCIP30Instance: BroswerExtensionCIP30Api
) => T.Task<TxOutRef[]> = (extensionCIP30Instance) =>
  pipe(
    T.Do,
    T.bind("uxtxos", () => pipe(() => extensionCIP30Instance.getUtxos())),
    T.map(({ uxtxos }) =>
      uxtxos == undefined ? [] : pipe(uxtxos, A.map(deserializeCollateral))
    )
  );
const fetchCollaterals: (
  extensionCIP30Instance: BroswerExtensionCIP30Api
) => T.Task<TxOutRef[]> = (extensionCIP30Instance) =>
  pipe(
    T.Do,
    T.bind("collaterals", () =>
      pipe(() => extensionCIP30Instance.experimental.getCollateral())
    ),
    T.map(({ collaterals }) =>
      collaterals == undefined
        ? []
        : pipe(collaterals, A.map(deserializeCollateral))
    )
  );

const deserializeAddress: (addressHex: string) => AddressBech32 = (
  addressHex
) =>
  pipe(
    C.Address.from_bytes(hex.decode(addressHex)).to_bech32(undefined),
    addressBech32
  );

const deserializeCollateral: (collateral: string) => TxOutRef = (collateral) =>
  pipe(C.TransactionUnspentOutput.from_bytes(hex.decode(collateral)), (utxo) =>
    pipe(utxo.input().to_json(), JSON.parse, (x) =>
      txOutRef(x.transaction_id + "#" + x.index)
    )
  );

type DataSignature = {
  signature: string;
  key: string;
};

type Cardano = {
  [key: string]: {
    name: string;
    icon: string;
    apiVersion: string;
    enable: () => Promise<BroswerExtensionCIP30Api>;
  };
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

const fetchTokens: (
  extensionCIP30Instance: BroswerExtensionCIP30Api
) => TE.TaskEither<Error, Token[]> = (extensionCIP30Instance) =>
  pipe(
    () => extensionCIP30Instance.getBalance(),
    T.map((balances) => pipe(balances, deserializeValue, valueToTokens)),
    TE.fromTask
  );

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

const fetchLovelaces: (
  extensionCIP30Instance: BroswerExtensionCIP30Api
) => TE.TaskEither<Error, bigint> = (extensionCIP30Instance) =>
  pipe(
    () => extensionCIP30Instance.getBalance(),
    T.map((balances) => pipe(balances, deserializeValue, valueToLovelaces)),
    TE.fromTask
  );

const valueToLovelaces = (value: Core.Value) =>
  BigInt(value.coin().to_str()).valueOf();
