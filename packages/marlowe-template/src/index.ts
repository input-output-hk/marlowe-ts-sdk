/**
 * This is an `experimental` package that helps with the definition and sharing of the parameters of
 * a Marlowe contract template.
 *
 * We call a contract template to a function (e.g. `mkContract`) that receives a set of parameters and returns a Marlowe contract.
 * Manually sharing the contract parameters can be challenging, so this package aims to solve that by
 * serializing the parameters {@link MarloweTemplate.toMetadata | to} and
 * {@link MarloweTemplate.fromMetadata | from} {@link @marlowe.io/runtime-core!index.Metadata}.
 *
 * ```
 * import { mkMarloweTemplate, TemplateParametersOf } from "@marlowe.io/marlowe-template";
 * import { addressBech32 } from "@marlowe.io/runtime-core";
 *
 * const myTemplate = mkMarloweTemplate({
 *   name: "My template example",
 *   description: "This defines the parameters of a simple contract",
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
 *   metadata: myTemplate.toMetadata(contractParameters)
 * })
 * ```
 * @packageDocumentation
 */
export {
  MarloweTemplate,
  mkMarloweTemplate,
  MkTemplateOptions,
  TemplateParametersOf,
  Expand,
  DecodingTemplateError,
} from "./template.js";
export {
  TemplateParam,
  TemplateType,
  StringParam,
  ValueParam,
  AddressParam,
  DateParam,
  TemplateKeys,
  TypeOfParam,
  TokenParam,
} from "./template-param.js";
