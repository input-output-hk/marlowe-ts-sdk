import { WalletAPI } from "../api.js";
import * as Browser from "../browser/index.js";

type WalletHandler = (walletId: string, wallet: WalletAPI) => void;
export const mkPeerConnectAdapter = () => {
  let wallet: WalletAPI | undefined;
  let newWalletHandler: WalletHandler = () => {};
  let deleteWalletHandler: WalletHandler = () => {};
  return {
    adaptApiEject(walletName: string, walletId: string) {
      if (wallet) {
        deleteWalletHandler(walletId, wallet);
      }
      wallet = undefined;
    },
    async adaptApiInject(walletName: string, walletId: string) {
      const di = {
        extension: await window.cardano[walletName.toLowerCase()].enable(),
      };
      const peerWallet = {
        waitConfirmation: Browser.waitConfirmation(di),
        signTx: Browser.signTx(di),
        getChangeAddress: Browser.getChangeAddress(di),
        getUsedAddresses: Browser.getUsedAddresses(di),
        getCollaterals: Browser.getCollaterals(di),
        getUTxOs: Browser.getUTxOs(di),
        isMainnet: Browser.isMainnet(di),
        getTokens: Browser.getTokens(di),
        getLovelaces: Browser.getLovelaces(di),
      };
      wallet = peerWallet;
      newWalletHandler(walletId, peerWallet);
    },
    onNewWallet(handler: WalletHandler) {
      newWalletHandler = handler;
    },
    onDeleteWallet(handler: WalletHandler) {
      deleteWalletHandler = handler;
    },
    getWallet() {
      return wallet;
    },
  };
};
