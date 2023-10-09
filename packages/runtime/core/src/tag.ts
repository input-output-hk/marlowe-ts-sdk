import * as t from "io-ts/lib/index.js";

export type Tag = t.TypeOf<typeof Tag>;
export const Tag = t.string;

// QUESTION: @Jamie, N.H. is this right, TagContent can be anything?
export type TagContent = any;
export const TagContent = t.any;

export type Tags = { [key in Tag]: TagContent };
export const TagsGuard = t.record(Tag, TagContent);

export const noTags: Tag[] = [];
