import * as t from "io-ts/lib/index.js";
import { DateFromEpochMS, StringCodec } from "./codecs.js";
import {
  AddressBech32,
  AddressBech32Guard,
  Metadata,
  MetadatumGuard,
} from "@marlowe.io/runtime-core";
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
  ? AddressBech32
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
    return StringCodec.pipe(AddressBech32Guard);
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
    this.name = args.name;
    this.description = args.description;

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
  }

  is(value: unknown): value is T {
    return this.blueprintCodec.is(value);
  }

  decode(value: Metadata): T {
    const decoded = this.blueprintCodec.decode(value);
    if (decoded._tag === "Right") {
      return decoded.right;
    } else {
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
