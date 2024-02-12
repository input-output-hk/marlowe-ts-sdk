import { Address } from "@marlowe.io/language-core-v1";
import { MarloweJSON } from "@marlowe.io/adapter/codec";
import * as t from "io-ts/lib/index.js";
import { DateFromEpochMS, StringCodec } from "./codecs.js";
import { Metadata, MetadatumGuard } from "@marlowe.io/runtime-core";
import {
  BigIntOrNumber,
  BigIntOrNumberGuard,
} from "@marlowe.io/adapter/bigint";

type StringParam<Name extends string> = Readonly<{
  name: Name;
  type: "string";
  description?: string;
}>;

type ValueParam<Name extends string> = Readonly<{
  name: Name;
  type: "value";
  description?: string;
}>;

type AddressParam<Name extends string> = Readonly<{
  name: Name;
  type: "address";
  description?: string;
}>;

type DateParam<Name extends string> = Readonly<{
  name: Name;
  type: "date";
  description?: string;
}>;

type BlueprintParam<Name extends string> =
  | StringParam<Name>
  | ValueParam<Name>
  | AddressParam<Name>
  | DateParam<Name>;

type TypeOfParam<Param extends BlueprintParam<any>> = Param extends StringParam<
  infer Name
>
  ? string
  : Param extends ValueParam<infer Name>
  ? BigIntOrNumber
  : Param extends AddressParam<infer Name>
  ? Address
  : Param extends DateParam<infer Name>
  ? Date
  : never;

type BlueprintKeys<T extends readonly BlueprintParam<any>[]> = {
  [K in keyof T]: T[K] extends BlueprintParam<infer Name> ? Name : never;
}[number];

type BlueprintType<T extends readonly BlueprintParam<any>[]> = {
  [K in BlueprintKeys<T>]: TypeOfParam<Extract<T[number], { name: K }>>;
};

function blueprintParamCodec<Param extends BlueprintParam<any>>(
  param: Param
): t.Mixed {
  if (param.type === "string") {
    return StringCodec;
  } else if (param.type === "value") {
    return BigIntOrNumberGuard;
  } else if (param.type === "address") {
    return t.string;
  } else if (param.type === "date") {
    return DateFromEpochMS;
  } else {
    throw new Error("Invalid parameter type");
  }
}

function blueprintParamsCodec<T extends readonly BlueprintParam<any>[]>(
  blueprint: T
): t.Mixed {
  return t.tuple(blueprint.map(blueprintParamCodec) as any);
}

function blueprintParamsObjectGuard<T extends readonly BlueprintParam<any>[]>(
  blueprint: T
): t.Mixed {
  return t.type(
    Object.fromEntries(
      blueprint.map((param) => [param.name, blueprintParamCodec(param)])
    ) as any
  );
}

class Blueprint<T extends object> {
  private blueprintCodec: t.Type<T, t.OutputOf<typeof Metadata>, unknown>;
  name: string;
  description?: string;
  constructor(args: MkBlueprint<readonly BlueprintParam<any>[]>) {
    const blueprintParams = args.params;
    const paramListCodec = blueprintParamsCodec(blueprintParams);
    const paramObjectCodec = blueprintParamsObjectGuard(blueprintParams);

    this.blueprintCodec = Metadata.pipe(
      new t.Type<T, Metadata, Metadata>(
        args.name,
        paramObjectCodec.is,
        (val, ctx) => {
          const metadatum = val[9041] ?? (val["9041"] as unknown);
          if (typeof metadatum === "undefined") {
            return t.failure(val, ctx, "Missing metadata entry 9041");
          }
          if (typeof metadatum !== "object") {
            return t.failure(val, ctx, "Metadata entry 9041 is not an object");
          }
          if (metadatum === null) {
            return t.failure(val, ctx, "Metadata entry 9041 is null");
          }

          if ("v" in metadatum === false) {
            return t.failure(
              val,
              ctx,
              "Metadata entry 9041 doesn't have a version field"
            );
          }
          if ("params" in metadatum === false) {
            return t.failure(
              val,
              ctx,
              "Metadata entry 9041 doesn't have a params field"
            );
          }

          const version = metadatum["v" as any];

          if (
            !BigIntOrNumberGuard.is(version) ||
            BigIntOrNumberGuard.encode(version) !== 1n
          ) {
            return t.failure(
              val,
              ctx,
              "Metadata entry 9041 has an invalid version"
            );
          }
          const params = metadatum["params" as any];

          const paramList = paramListCodec.decode(metadatum["params" as any]);
          if (paramList._tag === "Left") {
            return t.failure(
              paramList.left[0].value,
              paramList.left[0].context,
              "Invalid params"
            );
          }
          const result = {} as any;
          blueprintParams.forEach((param, ix) => {
            result[param.name] = paramList.right[ix];
          });
          return t.success(result as T);
        },
        (values) => {
          // FIXME: Try to type
          let valuesAsList: any[] = [];
          // iterate over blueprintParams and for each entry.name, look for the values[name] a

          blueprintParams.forEach((param, ix) => {
            const value = (values as any)[param.name];
            if (typeof value === "undefined") {
              throw new Error(`The value for ${param.name} is missing`);
            }
            valuesAsList.push(value);
          });
          return {
            "9041": {
              v: 1,
              params: paramListCodec.encode(valuesAsList),
            },
          };
        }
      )
    );

    /**
    this.blueprintCodec = t.type({
      v: t.literal(1),
      params: t.unknown,
    }).pipe(
      // new t.Type<T, Metadata, {v: 1, params: unknown}>(
      new t.Type<T, any, any>(
        "Blueprint T",
        paramObjectCodec.is,
        (val, ctx) => {
          return null as any;
          // throw new Error("Not implemented");
          // if (paramObjectCodec.is(val)) {
          //   return t.success(val);
          // } else {
          //   return t.failure(val, ctx);
          // }
        },
        (values) => {
          return {
            v: 1,
            params: []
          } as Metadata;
          // throw new Error("Not implemented");
        // paramObjectCodec.encode
        }
      )
    )
     */
  }

  is(value: unknown): value is T {
    return this.blueprintCodec.is(value);
  }

  decode(value: Metadata): T {
    const decoded = this.blueprintCodec.decode(value);
    if (decoded._tag === "Right") {
      return decoded.right;
    } else {
      console.log(MarloweJSON.stringify(decoded.left, null, 2));
      throw new Error("Invalid value");
    }
  }

  encode(value: T): t.OutputOf<typeof Metadata> {
    return this.blueprintCodec.encode(value);
  }
}

/**
 * This type function helps expanding the calculation of a type. It is used
 * in mkBlueprint to show the results of BlueprintType. When it is not used,
 * the types are hard to read.
 */
type Expand<T> = T extends infer O ? { [K in keyof O]: O[K] } : never;

export type BlueprintOf<T> = T extends Blueprint<infer U> ? U : never;

export type MkBlueprint<T extends readonly BlueprintParam<any>[]> = {
  name: string;
  description?: string;
  params: T;
};

export function mkBlueprint<T extends readonly BlueprintParam<any>[]>(
  args: MkBlueprint<T>
): Blueprint<Expand<BlueprintType<T>>> {
  return new Blueprint(args);
}

// Example DelayPayment

// const delayPaymentBlueprint = mkBlueprint([
//   {
//     name: "payFrom",
//     description: "Who is making the delayed payment",
//     type: "address",
//   },
//   {
//     name: "payTo",
//     description: "Who is receiving the payment",
//     type: "address",
//   },
//   {
//     name: "amount",
//     description: "The amount of lovelaces to be paid",
//     type: "value",
//   },
//   {
//     name: "depositDeadline",
//     description:
//       "The deadline for the payment to be made. If the payment is not made by this date, the contract can be closed",
//     type: "date",
//   },
//   {
//     name: "releaseDeadline",
//     description:
//       "A date after the payment can be released to the receiver. NOTE: An empty transaction must be done to close the contract",
//     type: "date",
//   },
// ] as const);

// console.log(
//   "example 3",
//   MarloweJSON.stringify(decoded1, null, 2)
// );

// console.log(decoded1.amount);

// console.log(delayPaymentBlueprint.encode({
//   payFrom: {address: "address1"},
//   payTo: {address: "address2"},
//   amount: 42n,
//   depositDeadline: new Date("2024-02-02"),
//   releaseDeadline: new Date("2024-02-02"),
// }))
