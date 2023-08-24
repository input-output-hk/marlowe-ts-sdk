
export function getMarloweRuntimeUrl () : string {
    const { MARLOWE_WEB_SERVER_URL} = process.env;
    if (MARLOWE_WEB_SERVER_URL == undefined) throw "environment configurations not available(MARLOWE_WEB_SERVER_URL)"
    return MARLOWE_WEB_SERVER_URL as string
};

