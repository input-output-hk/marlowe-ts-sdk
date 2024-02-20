/**
 * This is an `experimental` package that helps with the definition and sharing of the parameters of
 * a Marlowe contract template.
 *
 * We call a contract template to a function that receives a set of parameters and returns a Marlowe contract.
 * Manually sharing the contract parameters can be challenging, so this package aims to solve that by {@link Blueprint.encode | encoding}
 * and {@link Blueprint.decode | decoding}  the parameters as {@link @marlowe.io/runtime-core!index.Metadata}.
 *
 * ```
 * import { mkMarloweTemplate, TemplateParametersOf } from "@marlowe.io/blueprint";
 * import { addressBech32 } from "@marlowe.io/runtime-core";
 *
 * const myTemplate = mkMarloweTemplate({
 *   name: "My template example",
 *   description: "This is a blueprint for a simple object",
 *   params: [
 *     {
 *       name: "aString",
 *       type: "string",
 *       description: "A string parameter"
 *     },
 *     {
 *       name: "aValue",
 *       type: "value",
 *       description: "A `number | bigint` parameter",
 *     },
 *     {
 *       name: "anAddress",
 *       type: "address",
 *       description: "An AddressBech32 parameter",
 *     },
 *   ] as const, // it is important to use `as const` for the inference to work correctly
 * });
 *
 * // The inferred type of `MyTemplateParameters` is:
 * // type MyTemplateParameters = {
 * //   aString: string;
 * //   aValue: number | bigint;
 * //   anAddress: AddressBech32;
 * // };
 * type MyTemplateParameters = TemplateParametersOf<typeof myTemplate>;
 *
 * const contractParameters: MyTemplateParameters = {
 *   aString: "hello",
 *   aValue: 42n,
 *   anAddress: addressBech32("replace for a valid bech32 address"),
 * };
 *
 * runtime.contracts.create({
 *   contract: mkContract(contractParameters),
 *   metadata: myTemplate.encode(contractParameters)
 * })
 * ```
 * @packageDocumentation
 */
export {
  Blueprint,
  mkMarloweTemplate,
  MkBlueprintOptions,
  TemplateParametersOf,
  Expand,
  DecodingBlueprintError,
} from "./blueprint.js";
export {
  BlueprintParam,
  BlueprintType,
  StringParam,
  ValueParam,
  AddressParam,
  DateParam,
  BlueprintKeys,
  TypeOfParam,
  TokenParam,
} from "./blueprint-param.js";
