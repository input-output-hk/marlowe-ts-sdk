import * as t from "io-ts/lib/index.js";
import { assertGuardEqual, proxy } from "@marlowe.io/adapter/io-ts";
import { unsafeEither } from "@marlowe.io/adapter/fp-ts";

export interface ItemRangeBrand {
  readonly ItemRange: unique symbol;
}

export const ItemRangeGuard = t.brand(
  t.string,
  (s): s is t.Branded<string, ItemRangeBrand> => true,
  "ItemRange"
);

export type ItemRange = t.TypeOf<typeof ItemRangeGuard>;

export const itemRanged = (s: string) => unsafeEither(ItemRangeGuard.decode(s));

export interface Page {
  current: ItemRange;
  next?: ItemRange;
  /**
   * Total Contracts from the query.
   */
  total: number;
}
/**
 * This is a {@link !io-ts-usage | Dynamic type validator} for {@link GetContractsResponse}.
 * @category Pagination
 * @hidden
 */
export const PageGuard = assertGuardEqual(
  proxy<Page>(),
  t.intersection([
    t.type({
      total: t.number,
      current: ItemRangeGuard,
    }),
    t.partial({ previous: ItemRangeGuard }),
    t.partial({ next: ItemRangeGuard }),
  ])
);