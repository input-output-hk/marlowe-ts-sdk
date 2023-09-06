import * as C from "io-ts/lib/Codec.js";
import * as D from "io-ts/lib/Decoder.js";
import * as E from "io-ts/lib/Encoder.js";
import JSONbigint from "json-bigint";

export type DecodingError = string[];

export const MarloweJSON = JSONbigint({
  alwaysParseAsBig: true,
  useNativeBigInt: true,
});

export const MarloweJSONDecoder: D.Decoder<string, unknown> = {
  decode: (data) => (data === "" ? null : MarloweJSON.parse(data)),
};

export const MarloweJSONEncoder: E.Encoder<string, unknown> = {
  encode: (data) => MarloweJSON.stringify(data),
};

export const MarloweJSONCodec: C.Codec<string, string, unknown> = C.make(
  MarloweJSONDecoder,
  MarloweJSONEncoder
);

export const minify = (a: string) => a.replace(/[\n\r\s]/g, "");
