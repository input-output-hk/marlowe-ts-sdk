

import * as t from "io-ts";
import { identity } from 'fp-ts/lib/function'
import { failure, success, Type } from 'io-ts'
import {PositiveBigInt} from 'io-ts-bigint'                


export function isBigIntOrNumber(u: unknown): u is (bigint | number)  {
    return typeof u === 'bigint' || typeof u === 'number'
}

export const bigint = new Type<bigint | number, bigint, unknown>(
    'bigint',
    isBigIntOrNumber,
    (i, c) => (isBigIntOrNumber(i) ? success(i) : failure(i, c)),
    ((number) => BigInt(number))
    )

export type BlockHeader = t.TypeOf<typeof BlockHeader>
export const BlockHeader = t.type({ slotNo:bigint  
                                  , blockNo:bigint 
                                  , blockHeaderHash:t.string})

                