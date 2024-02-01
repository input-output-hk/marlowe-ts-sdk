import * as t from "io-ts/lib/index.js";
import * as R from "fp-ts/lib/Record.js";
import * as O from "fp-ts/lib/Option.js";

export interface Annotated<T> {
  annotation: T;
}

export function isAnnotated(value: unknown): value is Annotated<unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    "annotation" in value &&
    typeof value["annotation"] !== "undefined"
  );
}

export const AnnotatedGuard = <T>(guard: t.Type<T>): t.Type<Annotated<T>> =>
  t.type({ annotation: guard });

export function stripAnnotations<T>(value: T): T {
  if (typeof value !== "object" || value === null) {
    return value;
  }
  if (value instanceof String) {
    return `${value}` as T;
  }
  if (Array.isArray(value)) {
    return value.map(stripAnnotations) as T;
  }
  return R.filterMapWithIndex((key, v) =>
    key === "annotation" ? O.none : O.some(stripAnnotations(v))
  )(value as any) as T;
}
