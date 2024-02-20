import * as t from "io-ts/lib/index.js";
import { Metadata, MetadataGuard } from "@marlowe.io/runtime-core";
import { BigIntOrNumberGuard } from "@marlowe.io/adapter/bigint";
import {
  BlueprintParam,
  BlueprintType,
  blueprintParamsCodec,
  blueprintParamsObjectGuard,
} from "./blueprint-param.js";

/**
 * This class represents an error while decoding the Metadata according to a {@link Blueprint}.
 * @category Blueprint
 */
export class DecodingBlueprintError extends Error {
  constructor(
    public blueprint: Blueprint<any>,
    /**
     * @see {@link https://github.com/gcanti/io-ts/blob/master/index.md#error-reporters | io-ts errors }
     */
    public error: t.Errors
  ) {
    super("Error while decoding a blueprint");
    this.name = "DecodingBlueprintError";
  }
}

/**
 * This class holds information on the parameters required to create a Marlowe contract and
 * a way to {@link Blueprint.encode} and {@link Blueprint.decode} the contract parameters as {@link @marlowe.io/runtime-core!index.Metadata}.
 * The order of the parameters is important as it is used by the codec to encode and decode.
 *
 * The Metadata encoding is as following:
 * A top level entry with key `9041` and value with an object with two fields:
 * - `v` a numeric version of the Blueprint encoding (current version is 1)
 * - `params` an array of the encoded parameters with the same order as the Blueprint parameters.
 * @see {@link BlueprintParam} to see how each parameter is encoded.
 * @typeParam ObjectParams - The inferred type of the `options.params` as an object.
 * @experimental
 * @category Blueprint
 */
export class Blueprint<ObjectParams extends object> {
  private blueprintCodec: t.Type<ObjectParams, Metadata, unknown>;
  name: string;
  description?: string;
  constructor(options: MkBlueprintOptions<readonly BlueprintParam<any>[]>) {
    const blueprintParams = options.params;
    this.name = options.name;
    this.description = options.description;

    const paramListCodec = blueprintParamsCodec(blueprintParams);
    const paramObjectCodec = blueprintParamsObjectGuard(blueprintParams);

    this.blueprintCodec = MetadataGuard.pipe(
      new t.Type<ObjectParams, Metadata, Metadata>(
        options.name,
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
          return t.success(result as ObjectParams);
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

  /**
   * Type guard for the ObjectParams type.
   * @param value - an unknown value to check if it is a valid ObjectParams.
   * @returns true if the value is a valid ObjectParams, false otherwise.
   */
  is(value: unknown): value is ObjectParams {
    return this.blueprintCodec.is(value);
  }
  /**
   * Decodes a Metadata into an ObjectParams.
   * @param value - a Metadata to decode.
   * @returns the decoded ObjectParams.
   * @throws {@link DecodingBlueprintError} - if the value is not a valid Metadata.
   */
  decode(value: Metadata): ObjectParams {
    const decoded = this.blueprintCodec.decode(value);
    if (decoded._tag === "Right") {
      return decoded.right;
    } else {
      throw new DecodingBlueprintError(this, decoded.left);
    }
  }
  // NOTE: The output of the encode is the output of the Metadata codec,
  //       which is compatible with its inputs, but it doesn't have the
  //       branded types. Here we cast to the Metadata type to allow easier
  //       usability with the rest of the runtime, that expects the Branded
  //       types.
  /**
   * Encodes the given value into a Metadata object.
   *
   * @param value The value to be encoded.
   * @returns The encoded Metadata object.
   */
  encode(value: ObjectParams): Metadata {
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
 * Options to create a new {@link Blueprint}.
 * @typeParam ListParams - An ordered list of the different parameters that conform the blueprint.
 * @category Blueprint
 */
export interface MkBlueprintOptions<
  ListParams extends readonly BlueprintParam<any>[],
> {
  /**
   * The name of the blueprint.
   */
  name: string;
  /**
   * An optional description of the blueprint.
   */
  description?: string;
  /**
   * The different parameters that conform the blueprint.
   */
  params: ListParams;
}

/**
 * Creates a new {@link Blueprint} with the given options.
 * This function helps with the inference of the un-ordered ObjectParams record from the ordered ListParams.
 *
 * ObjectParams are useful when coding, to provide name to the parameter without caring about the order,
 * and ListParams are useful to specify how the Blueprint should be encoded/decoded in a space performant way.
 * @experimental
 * @typeParam ListParams - An ordered list of the different parameters that conform the blueprint.
 * @category Blueprint
 */
export function mkBlueprint<ListParams extends readonly BlueprintParam<any>[]>(
  options: MkBlueprintOptions<ListParams>
): Blueprint<Expand<BlueprintType<ListParams>>> {
  return new Blueprint(options);
}
