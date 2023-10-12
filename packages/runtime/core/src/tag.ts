import * as t from "io-ts/lib/index.js";

export type Tag = t.TypeOf<typeof Tag>;
export const Tag = t.string;

// QUESTION: @Jamie, N.H. is this right, TagContent can be anything?
export type TagContent = any;
export const TagContent = t.any;

/**
 * A map of tags to their content. The key is a string, the value can be anything.
 */
export type Tags = { [key in Tag]: TagContent };

/**
 * @hidden
 */
export const TagsGuard = t.record(Tag, TagContent);

export const noTags: Tag[] = [];
