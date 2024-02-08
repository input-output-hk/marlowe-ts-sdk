import { Address } from "@marlowe.io/language-core-v1";
import { MarloweJSON } from "@marlowe.io/adapter/codec";
import * as t from "io-ts/lib/index.js";
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
  ? bigint
  : Param extends AddressParam<infer Name>
  ? Address
  : Param extends DateParam<infer Name>
  ? Date
  : never;

type Blueprint<T extends readonly BlueprintParam<any>[]> = T;
type TypeOfBlueprint<T extends readonly BlueprintParam<any>[]> = Blueprint<T>;

type BlueprintKeys<T extends readonly BlueprintParam<any>[]> = {
  [K in keyof T]: T[K] extends BlueprintParam<infer Name> ? Name : never;
}[number];

type BlueprintType<T extends readonly BlueprintParam<any>[]> = {
  [K in BlueprintKeys<T>]: TypeOfParam<Extract<T[number], { name: K }>>;
};

function blueprintParamGuard<Param extends BlueprintParam<any>>(
  param: Param
): t.Mixed {
  if (param.type === "string") {
    return t.string;
  } else if (param.type === "value") {
    return t.bigint;
  } else if (param.type === "address") {
    return t.string;
  } else if (param.type === "date") {
    return t.number;
  } else {
    throw new Error("Invalid parameter type");
  }
}

function blueprintGuard<T extends readonly BlueprintParam<any>[]>(
  blueprint: T
): t.Mixed {
  return t.tuple(blueprint.map(blueprintParamGuard) as any);
}

// Example FooBar

const fooParam = {
  name: "foo",
  type: "string",
  description: "A string",
} as const;

type fooType = TypeOfParam<typeof fooParam>;

const barParam = {
  name: "bar",
  type: "value",
  description: "A number",
} as const;

type barParamType = TypeOfParam<typeof barParam>;

const fooBarBlueprint = [fooParam, barParam] as const;
type fooBarType = TypeOfBlueprint<typeof fooBarBlueprint>;
type fooBarKeys = BlueprintKeys<typeof fooBarBlueprint>;

type fooBarBlueprintType = BlueprintType<typeof fooBarBlueprint>;

const fooBarGuard = blueprintGuard(fooBarBlueprint);

const fooBar = ["hello", 42] as const;

// console.log("example 1");
// console.log(fooBarGuard.decode(fooBar));

const fooBar2 = [42, "hello"] as const;

// console.log("example 2");
// console.log(JSON.stringify(fooBarGuard.decode(fooBar2), null, 2));

// Example DelayPayment

const delayPaymentBlueprint = [
  {
    name: "payFrom",
    description: "Who is making the delayed payment",
    type: "address",
  },
  {
    name: "payTo",
    description: "Who is receiving the payment",
    type: "address",
  },
  {
    name: "amount",
    description: "The amount of lovelaces to be paid",
    type: "value",
  },
  {
    name: "depositDeadline",
    description:
      "The deadline for the payment to be made. If the payment is not made by this date, the contract can be closed",
    type: "date",
  },
  {
    name: "releaseDeadline",
    description:
      "A date after the payment can be released to the receiver. NOTE: An empty transaction must be done to close the contract",
    type: "date",
  },
] as const;

type delayPaymentBlueprintType = BlueprintType<typeof delayPaymentBlueprint>;

const delayPaymentGuard = blueprintGuard(delayPaymentBlueprint);
const dp1 = ["address1", "address2", 42n, 1234567890, 1234567890] as const;
console.log(
  "example 3",
  MarloweJSON.stringify(delayPaymentGuard.decode(dp1), null, 2)
);
