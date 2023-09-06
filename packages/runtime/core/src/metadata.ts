import * as t from "io-ts/lib/index.js";

export type MetadatumLabel = t.TypeOf<typeof MetadatumLabel>;
export const MetadatumLabel = t.union([t.bigint, t.string]);

export type Metadatum = t.TypeOf<typeof MetadatumLabel>;
export const Metadatum = t.any;

export type Metadata = t.TypeOf<typeof Metadata>;
export const Metadata = t.record(MetadatumLabel, Metadatum);
