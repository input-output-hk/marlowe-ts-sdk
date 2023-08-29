import * as t from "io-ts/lib/index.js";

export type  Tag = t.TypeOf<typeof Tag>
export const Tag = t.string

export type  TagContent = t.TypeOf<typeof TagContent>
export const TagContent = t.any

export type  Tags = t.TypeOf<typeof Tags>
export const Tags = t.record(Tag, TagContent)

export const noTags : Tag[]= []