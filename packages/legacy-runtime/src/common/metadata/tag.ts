import * as t from "io-ts/lib/index.js";
import { Metadata } from "./index.js";


export type  Tag = t.TypeOf<typeof Tag>
export const Tag = t.string

export type  Tags = t.TypeOf<typeof Tags>
export const Tags = t.record(Tag, Metadata)

export const noTags : Tag[]= []