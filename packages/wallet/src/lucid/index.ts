import { Lucid, Unit, fromUnit, Assets as LucidAssets } from "lucid-cardano";

import { WalletAPI } from "../api.js";
import * as runtimeCore from "@marlowe.io/runtime-core";
import * as Codec from "@47ng/codec";
import { pipe } from "fp-ts/lib/function.js";
import * as A from "fp-ts/lib/Array.js";
import * as R from "fp-ts/lib/Record.js";
import { Monoid } from "fp-ts/lib/Monoid.js";
type LucidDI = { lucid: Lucid };

const getAssetName: (unit: Unit) => string = (unit) => {
  const assetName = fromUnit(unit).assetName;
  return assetName ? Codec.hexToUTF8(assetName) : "";
};

// Function that tells how to join two assets
const addAssets = { concat: (x: bigint, y: bigint) => x + y };

// A monoid for Lucid's Assets indicates how to create
// an empty Assets object and how to merge two Assets objects.
const mergeAssets: Monoid<LucidAssets> = {
  // Lucid's Assets object are a Record<string, bigint>,
  // so the empty assets is the empty object
  empty: {},
  // And to join two assets we join the two records. When
  // the "assetId" is the same, the quantities are added.
  concat: (x, y) => R.union(addAssets)(x)(y),
};

// NOTE: This function may report a different amount of lovelaces than
//       a CIP-30 wallet, as this can't take into account the collateral
//       UTxO.
const getTokens =
  ({ lucid }: LucidDI) =>
  async (): Promise<runtimeCore.Token[]> => {
    const utxos = await lucid.wallet.getUtxos();

    return pipe(
      utxos, // UTxO[]
      A.map((utxo) => utxo.assets), // LucidAssets[]
      A.reduce(mergeAssets.empty, mergeAssets.concat), // LucidAssets
      R.toEntries, // Array<[string, bigint]>
      A.map(([unit, quantity]) => {
        if (unit === "lovelace") {
          return runtimeCore.lovelaces(quantity);
        } else {
          return runtimeCore.token(quantity)(
            runtimeCore.assetId(
              runtimeCore.mkPolicyId(fromUnit(unit).policyId)
            )(getAssetName(unit))
          );
        }
      })
    );
  };

const isMainnet =
  ({ lucid }: LucidDI) =>
  async () => {
    return lucid.network == "Mainnet";
  };

/**
 * Create a {@link WalletAPI} from a Lucid wallet instance that can work both in the
 * backend (Node.js/Deno) and in the browser
 */
export function mkLucidWallet(lucidWalletAPI: Lucid): WalletAPI {
  const di = { lucid: lucidWalletAPI };
  return {
    waitConfirmation: null as any,
    signTx: null as any,
    getChangeAddress: null as any,
    getUsedAddresses: null as any,
    getCollaterals: null as any,
    getUTxOs: null as any,
    isMainnet: isMainnet(di),
    getTokens: getTokens(di),
    getLovelaces: null as any,
  };
}
