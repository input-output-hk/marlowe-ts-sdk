import * as API from "@blockfrost/blockfrost-js";
import {
  Blockfrost,
  Lucid,
  C,
  Network,
  PrivateKey,
  PolicyId,
  getAddressDetails,
  toUnit,
  fromText,
  NativeScript,
  Tx,
  TxSigned,
  TxComplete,
  Script,
  fromHex,
  toHex,
  fromUnit,
  Unit,
} from "lucid-cardano";
import * as A from "fp-ts/lib/Array.js";
import { pipe } from "fp-ts/lib/function.js";
import * as O from "fp-ts/lib/Option.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import * as T from "fp-ts/lib/Task.js";

import {
  AddressBech32,
  TxOutRef,
  addressBech32,
  unAddressBech32,
  MarloweTxCBORHex,
  Token,
  lovelaces,
  token,
  assetId,
  mkPolicyId,
  unPolicyId,
  AssetId,
} from "@marlowe.io/runtime-core";
import { WalletAPI } from "../api.js";
import * as Codec from "@47ng/codec";

const log = (message: string) => console.log(`\t## - ${message}`);

// TODO: Make nominal
export type PrivateKeysAsHex = string;
export type Address = string;

// TODO: This is a pure datatype, convert to type alias or interface
export class Context {
  projectId: string;
  network: Network;
  blockfrostUrl: string;

  public constructor(
    projectId: string,
    blockfrostUrl: string,
    network: Network
  ) {
    this.projectId = projectId;
    this.network = network;
    this.blockfrostUrl = blockfrostUrl;
  }
}

// [[testing-wallet-discussion]]
// DISCUSSION: Currently this class is more of a testing helper rather than being a NodeJS
//             implementation of the WalletAPI. It has extra methods for funding a wallet
//             and minting test tokens and it is missing some required methods like getUTxOs.
//
//             If we want to support a NodeJS implementation of the WalletAPI we should
//             probably remove the extra methods and find a way to share the Blockfrost
//             (or eventual underlying service) for testing.
//
//             It we don't want to support a NodeJS library for the moment, then this could
//             be moved to a @marlowe.io/runtime-xxx package, as it is not helping test the
//             wallet, but the runtime.
/**
 * @hidden
 */
export class SingleAddressWallet implements WalletAPI {
  private privateKeyBech32: string;
  private context: Context;
  private lucid: Lucid;
  private blockfrostApi: API.BlockFrostAPI;

  public address: AddressBech32;
  getChangeAddress: T.Task<AddressBech32>;
  getUsedAddresses: T.Task<AddressBech32[]>;
  getCollaterals: T.Task<TxOutRef[]>;

  private constructor(context: Context, privateKeyBech32: PrivateKey) {
    this.privateKeyBech32 = privateKeyBech32;
    this.context = context;
    this.blockfrostApi = new API.BlockFrostAPI({
      projectId: context.projectId,
    });
  }

  // TODO: Extract this to its own function
  public static Initialise(
    context: Context,
    privateKeyBech32: string
  ): T.Task<SingleAddressWallet> {
    const account = new SingleAddressWallet(context, privateKeyBech32);
    return () => account.initialise().then(() => account);
  }

  static Random(context: Context): T.Task<SingleAddressWallet> {
    const privateKey = C.PrivateKey.generate_ed25519().to_bech32();
    const account = new SingleAddressWallet(context, privateKey);
    return () => account.initialise().then(() => account);
  }

  private async initialise() {
    this.lucid = await Lucid.new(
      new Blockfrost(this.context.blockfrostUrl, this.context.projectId),
      this.context.network
    );
    this.lucid.selectWalletFromPrivateKey(this.privateKeyBech32);
    this.address = addressBech32(await this.lucid.wallet.address());
    this.getChangeAddress = T.of(this.address);
    this.getUsedAddresses = T.of([this.address]);
    this.getCollaterals = T.of([]);
  }

  async getCIP30Network() {
    if (this.lucid.network === "Mainnet") {
      return "Mainnet" as const;
    } else {
      return "Testnets" as const;
    }
  }

  async getTokens(): Promise<Token[]> {
    try {
      const content = await this.blockfrostApi.addresses(
        unAddressBech32(this.address)
      );
      return pipe(
        content.amount ?? [],
        A.map((tokenBlockfrost) =>
          tokenBlockfrost.unit === "lovelace"
            ? lovelaces(BigInt(tokenBlockfrost.quantity))
            : token(BigInt(tokenBlockfrost.quantity).valueOf())(
                assetId(mkPolicyId(fromUnit(tokenBlockfrost.unit).policyId))(
                  getAssetName(tokenBlockfrost.unit)
                )
              )
        )
      );
    } catch (reason) {
      throw new Error(`Error while retrieving assetBalance : ${reason}`);
    }
  }

  async getLovelaces(): Promise<bigint> {
    try {
      const content = await this.blockfrostApi.addresses(
        unAddressBech32(this.address)
      );
      return pipe(
        content.amount ?? [],
        A.filter((amount) => amount.unit === "lovelace"),
        A.map((amount) => BigInt(amount.quantity)),
        A.head,
        O.getOrElse(() => 0n)
      );
    } catch (reason) {
      throw new Error(`Error while retrieving assetBalance : ${reason}`);
    }
  }

  public tokenBalance: (assetId: AssetId) => TE.TaskEither<Error, bigint> = (
    assetId
  ) =>
    pipe(
      TE.tryCatch(
        () => this.blockfrostApi.addresses(unAddressBech32(this.address)),
        (reason) => new Error(`Error while retrieving assetBalance : ${reason}`)
      ),
      TE.map((content) =>
        pipe(
          content.amount ?? [],
          A.filter(
            (amount) =>
              amount.unit ===
              toUnit(unPolicyId(assetId.policyId), fromText(assetId.assetName))
          ),
          A.map((amount) => BigInt(amount.quantity)),
          A.head,
          O.getOrElse(() => 0n)
        )
      )
    );

  // see [[testing-wallet-discussion]]
  public provision: (
    provisionning: [SingleAddressWallet, bigint][]
  ) => TE.TaskEither<Error, Boolean> = (provisionning) =>
    pipe(
      provisionning,
      A.reduce(
        this.lucid.newTx(),
        (tx: Tx, account: [SingleAddressWallet, bigint]) =>
          tx.payToAddress(unAddressBech32(account[0].address), {
            lovelace: account[1],
          })
      ),
      build,
      TE.chain(this.signSubmitAndWaitConfirmation)
    );

  // see [[testing-wallet-discussion]]
  public randomPolicyId(): [Script, PolicyId] {
    const { paymentCredential } = getAddressDetails(
      unAddressBech32(this.address)
    );
    const before = this.lucid.currentSlot() + 5 * 60;
    const json: NativeScript = {
      type: "all",
      scripts: [
        {
          type: "before",
          slot: before.valueOf(),
        },
        { type: "sig", keyHash: paymentCredential?.hash! },
      ],
    };
    const script = this.lucid.utils.nativeScriptFromJson(json);
    const policyId = this.lucid.utils.mintingPolicyToId(script);
    return [script, policyId];
  }

  // see [[testing-wallet-discussion]]
  public mintRandomTokens(
    assetName: string,
    amount: bigint
  ): TE.TaskEither<Error, Token> {
    const policyRefs = this.randomPolicyId();
    const [mintingPolicy, policyId] = policyRefs;
    return pipe(
      this.lucid
        .newTx()
        .mintAssets({
          [toUnit(policyId, fromText(assetName))]: amount.valueOf(),
        })
        .validTo(Date.now() + 100000)
        .attachMintingPolicy(mintingPolicy),
      build,
      TE.chain(this.signSubmitAndWaitConfirmation),
      TE.map(() => token(amount)(assetId(mkPolicyId(policyRefs[1]))(assetName)))
    );
  }
  async signTxTheCIP30Way(cborHex: MarloweTxCBORHex) {
    const tx = C.Transaction.from_bytes(fromHex(cborHex));
    try {
      const txSigned = await this.lucid.wallet.signTx(tx);
      return toHex(txSigned.to_bytes());
    } catch (reason) {
      throw new Error(`Error while signing : ${reason}`);
    }
  }

  public sign: (txBuilt: TxComplete) => TE.TaskEither<Error, TxSigned> = (
    txBuilt
  ) =>
    TE.tryCatch(
      () => txBuilt.sign().complete(),
      (reason) => new Error(`Error while signing : ${reason}`)
    );

  public submit: (signedTx: TxSigned) => TE.TaskEither<Error, string> = (
    signedTx
  ) =>
    TE.tryCatch(
      () => signedTx.submit(),
      (reason) => new Error(`Error while submitting : ${reason}`)
    );

  waitConfirmation(txHash: string) {
    try {
      return this.lucid.awaitTx(txHash);
    } catch (reason) {
      throw new Error(`Error while awiting : ${reason}`);
    }
  }
  // see [[testing-wallet-discussion]]
  public signSubmitAndWaitConfirmation: (
    txBuilt: TxComplete
  ) => TE.TaskEither<Error, boolean> = (txBuilt) =>
    pipe(
      this.sign(txBuilt),
      TE.chain(this.submit),
      TE.chainFirst((txHash) => TE.of(log(`<> Tx ${txHash} submitted.`))),
      TE.chain((txHash) =>
        TE.tryCatch(
          () => this.waitConfirmation(txHash),
          (reason) =>
            new Error(`Error while retrieving assetBalance : ${reason}`)
        )
      )
    );
  // FIXME: Implement
  // see [[testing-wallet-discussion]]
  public getUTxOs: T.Task<TxOutRef[]> = T.of([]);
}

const build: (tx: Tx) => TE.TaskEither<Error, TxComplete> = (tx) =>
  TE.tryCatch(
    () => tx.complete(),
    (reason) => new Error(`Error while building Tx : ${reason}`)
  );

const getAssetName: (unit: Unit) => string = (unit) => {
  const assetName = fromUnit(unit).assetName;
  return assetName ? Codec.hexToUTF8(assetName) : "";
};

/**
 * Currently used for testing
 * see [[testing-wallet-discussion]]
 * @hidden
 */
export const getPrivateKeyFromHexString = (privateKeyHex: string): PrivateKey =>
  C.PrivateKey.from_bytes(Buffer.from(privateKeyHex, "hex")).to_bech32();
