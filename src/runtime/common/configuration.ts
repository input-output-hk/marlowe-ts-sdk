import { Network } from "lucid-cardano";
import { Configuration, getPrivateKeyFromHexString } from "../../common/wallet";


export function getBlockfrostConfiguration () : Configuration {
    const { BLOCKFROST_URL, BLOCKFROST_PROJECT_ID, NETWORK_ID } = process.env;
    return new Configuration ( BLOCKFROST_PROJECT_ID as string
                             , BLOCKFROST_URL  as string
                             , NETWORK_ID as Network);
  };
  
export function getBankPrivateKey () : string {
    const { BANK_PK } = process.env;
    return getPrivateKeyFromHexString(BANK_PK as string)
}
  
export function getMarloweRuntimeUrl () : string {
    const { MARLOWE_WEB_SERVER_URL} = process.env;
    return MARLOWE_WEB_SERVER_URL as string
};
  