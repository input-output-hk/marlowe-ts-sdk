import * as t from "io-ts";
import * as C from 'io-ts/Codec'
import * as D from 'io-ts/Decoder'
import * as E from 'io-ts/Encoder'
import JSONbig from 'json-bigint'; //(({useNativeBigInt:false}))

const JsonAlwayAndOnlyBigInt = JSONbig ({
    alwaysParseAsBig: true,
    useNativeBigInt: true,
  });


export const MarloweJSONDecoder: D.Decoder<string, unknown> = {
  decode: (data) => (data === ''? null : JsonAlwayAndOnlyBigInt.parse(data))
}

export const MarloweJSONEncoder: E.Encoder<string, unknown> = {
  encode: (contract) =>  JsonAlwayAndOnlyBigInt.stringify(contract)
}

export const MarloweJSONCodec: C.Codec<string, string, unknown> = C.make(MarloweJSONDecoder, MarloweJSONEncoder)

export const minify = (a:string) => a.replace(/[\n\r\s]/g, '')