import * as t from "io-ts/lib/index.js";
import { DateFromEpochMS, StringCodec } from "./codecs.js";
import { AddressBech32, AddressBech32Guard } from "@marlowe.io/runtime-core";
import {
  BigIntOrNumber,
  BigIntOrNumberGuard,
} from "@marlowe.io/adapter/bigint";

/**
 * This type represents a string parameter in a {@link Blueprint}.
 * @category Blueprint parameters
 */
export type StringParam<Name extends string> = Readonly<{
  name: Name;
  type: "string";
  description?: string;
}>;

/**
 * This type represents a value parameter in a {@link Blueprint}.
 * @category Blueprint parameters
 */
export type ValueParam<Name extends string> = Readonly<{
  name: Name;
  type: "value";
  description?: string;
}>;

/**
 * This type represents an AddressBech32 parameter in a {@link Blueprint}.
 * @category Blueprint parameters
 */
export type AddressParam<Name extends string> = Readonly<{
  name: Name;
  type: "address";
  description?: string;
}>;

/**
 * This type represents a Date parameter in a {@link Blueprint}.
 * @category Blueprint parameters
 */
export type DateParam<Name extends string> = Readonly<{
  name: Name;
  type: "date";
  description?: string;
}>;

/**
 * This type represents one of the possible parameters in a {@link Blueprint}.
 * @category Blueprint parameters
 */
export type BlueprintParam<Name extends string> =
  | StringParam<Name>
  | ValueParam<Name>
  | AddressParam<Name>
  | DateParam<Name>;

/**
 * @internal
 * @category Type functions
 */
export type TypeOfParam<Param extends BlueprintParam<any>> =
  Param extends StringParam<infer Name>
    ? string
    : Param extends ValueParam<infer Name>
    ? BigIntOrNumber
    : Param extends AddressParam<infer Name>
    ? AddressBech32
    : Param extends DateParam<infer Name>
    ? Date
    : never;

/**
 * @internal
 * @category Type functions
 */
export type BlueprintKeys<T extends readonly BlueprintParam<any>[]> = {
  [K in keyof T]: T[K] extends BlueprintParam<infer Name> ? Name : never;
}[number];

/**
 * @internal
 * @category Type functions
 */
export type BlueprintType<T extends readonly BlueprintParam<any>[]> = {
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

/**
 * @hidden
 */
export function blueprintParamsCodec<T extends readonly BlueprintParam<any>[]>(
  blueprint: T
): t.Mixed {
  return t.tuple(blueprint.map(blueprintParamCodec) as any);
}

/**
 * @hidden
 */
export function blueprintParamsObjectGuard<
  T extends readonly BlueprintParam<any>[],
>(blueprint: T): t.Mixed {
  return t.type(
    Object.fromEntries(
      blueprint.map((param) => [param.name, blueprintParamCodec(param)])
    ) as any
  );
}
