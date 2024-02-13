import * as t from "io-ts/lib/index.js";
import { Metadata } from "@marlowe.io/runtime-core";
import { BigIntOrNumberGuard } from "@marlowe.io/adapter/bigint";
import {
  BlueprintParam,
  BlueprintType,
  blueprintParamsCodec,
  blueprintParamsObjectGuard,
} from "./blueprint-param.js";

/**
 * @category Blueprint
 */
export class Blueprint<T extends object> {
  private blueprintCodec: t.Type<T, t.OutputOf<typeof Metadata>, unknown>;
  name: string;
  description?: string;
  constructor(args: MkBlueprintOptions<readonly BlueprintParam<any>[]>) {
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
  // NOTE: The output of the encode is the output of the Metadata codec,
  //       which is compatible with its inputs, but it doesn't have the
  //       branded types. Here we cast to the Metadata type to allow easier
  //       usability with the rest of the runtime, that expects the Branded
  //       types.
  encode(value: T): Metadata {
    return this.blueprintCodec.encode(value) as Metadata;
  }
}

/**
 * This type function helps expanding the calculation of a type. It is used
 * in mkBlueprint to show the results of BlueprintType. When it is not used,
 * the types are hard to read.
 * @internal
 * @category Type functions
 */
export type Expand<T> = T extends infer O ? { [K in keyof O]: O[K] } : never;

/**
 * @category Blueprint
 */
export type BlueprintOf<T> = T extends Blueprint<infer U> ? U : never;

/**
 * @category Blueprint
 */
export type MkBlueprintOptions<T extends readonly BlueprintParam<any>[]> = {
  name: string;
  description?: string;
  params: T;
};

/**
 * @category Blueprint
 */
export function mkBlueprint<T extends readonly BlueprintParam<any>[]>(
  args: MkBlueprintOptions<T>
): Blueprint<Expand<BlueprintType<T>>> {
  return new Blueprint(args);
}
