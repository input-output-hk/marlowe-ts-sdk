import * as C from 'io-ts/lib/Codec.js'
import * as D from 'io-ts/lib/Decoder.js'
import * as E from 'io-ts/lib/Encoder.js'
import JSONbig from 'json-bigint'; //(({useNativeBigInt:false}))

export const JsonAlwayAndOnlyBigInt = JSONbig ({
    alwaysParseAsBig: true,
    useNativeBigInt: true,
  });


export const MarloweJSONDecoder: D.Decoder<string, unknown> = {
  decode: (data) => (data === ''? null : JsonAlwayAndOnlyBigInt.parse(data))
}

export const MarloweJSONEncoder: E.Encoder<string, unknown> = {
  encode: (data) =>  JsonAlwayAndOnlyBigInt.stringify(data)
}

export const MarloweJSONCodec: C.Codec<string, string, unknown> = C.make(MarloweJSONDecoder, MarloweJSONEncoder)

export const minify = (a:string) => a.replace(/[\n\r\s]/g, '')