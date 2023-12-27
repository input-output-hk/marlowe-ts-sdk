import * as t from "io-ts/lib/index.js";
import { withValidate } from "io-ts-types";
/**
 * In the TS-SDK we duplicate the type and guard definition for each type as the
 * inferred type from io-ts does not produce a good type export when used with
 * typedoc. Sadly this means we have to maintain two definitions for each type which
 * can lead to errors, so we need a mechanism to assert that the type and guard are
 * equal.
 * Normally we could simply do:
 ```
 interface Foo {
    prop: string;
 }
 const FooGuard: t.Type<Foo> = t.type({
    prop: t.string
 })
 ```
 * And the explicit type assertion in the FooGuard ensure us that the type are the same.
 * But when we include Branded or Newtype types in the definition, the full type is not the same
 ```
 interface Foo {
    prop: ContractId;
 }
 // This throws a type error
 const FooGuard: t.Type<Foo> = t.type({
    prop: ContractIdGuard
 })
 ```
 *
 * To understand the error we need to know that  `t.Type<A> = t.Type<A, O = A, I = unknown>`
 * where `A` is the underlying type, `O` is the Output type that we get when
 * we call `FooGuard.encode` and `I` is the Input type we expect when we call `FooGuard.decode`.
 * When we use a Branded or Newtype guard, the Output type is different from the underlying type,
 * so we get an error.
 *
 * The `assertGuardEqual` function can be used to only assert on the representation type A and leave
 * the Input and Output type unchanged.
 *
 ```
 interface Foo {
    prop: ContractId;
 }
 const FooGuard = assertGuardEqual(proxy<Foo>(), t.type({
    prop: ContractIdGuard
 }))
 ```
 */

export function assertGuardEqual<A, G extends t.Type<A, any, any>>(
  proxy: A,
  guard: G
): G {
  return guard;
}

/**
 * Utility function to set up an unused value with an explicit type A.
 * @returns
 */
export function proxy<A = never>(): A {
  return null as any;
}

/**
 * converts a null value to an undefined one.
 * @returns
 */
export function convertNullableToUndefined<C extends t.Mixed>(
  codec: C,
  name = `fromNullableToUndefined(${codec.name})`
): C {
  return withValidate(
    codec,
    (u, c) => (u == null ? t.success(undefined) : codec.validate(u, c)),
    name
  );
}
