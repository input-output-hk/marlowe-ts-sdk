import * as t from "io-ts";


export type  MetadatumLabel = t.TypeOf<typeof MetadatumLabel>
export const MetadatumLabel = t.union([t.bigint,t.string])

export type  Metadatum = t.TypeOf<typeof MetadatumLabel>
export const Metadatum = t.UnknownRecord

export type Metadata = t.TypeOf<typeof Metadata>
export const Metadata = t.record(MetadatumLabel, Metadatum)

export type  Tag = t.TypeOf<typeof Tag>
export const Tag = t.string

export type  Tags = t.TypeOf<typeof Tags>
export const Tags = t.record(Tag, Metadata)