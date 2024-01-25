import {
  ContractObjectMap,
  mapToContractBundle,
  stripContractBundleAnnotations,
} from "@marlowe.io/marlowe-object";
import { RuntimeLifecycle } from "@marlowe.io/runtime-lifecycle/api";
import * as t from "io-ts/lib/index.js";
import { ContractClosure, getContractClosure } from "./contract-closure.js";
import * as Core from "@marlowe.io/language-core-v1";
import * as CoreG from "@marlowe.io/language-core-v1/guards";
import * as Obj from "@marlowe.io/marlowe-object";
import * as ObjG from "@marlowe.io/marlowe-object/guards";

import * as M from "fp-ts/lib/Map.js";

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

// async function annotatedClosure<T>(source: ContractObjectMap<T>, lifecycle: RuntimeLifecycle): Promise<ContractClosure> {
//   debugger;
//   const {contractSourceId, intermediateIds} = await lifecycle.restClient.createContractSources(
//     stripContractBundleAnnotations(mapToContractBundle(source))
//   );

//   const closure = await getContractClosure({lifecycle})(contractSourceId);

//   // The intermediateIds is an object whose keys belong to the source code and value is the merkle hash.
//   // We need to reverse this object in order to annotate the closure using the source annotations.
//   // It is possible for two different source entries to have the same hash and different annotations.
//   // In that case the last annotation will prevail.
//   const sourceMap = Object.fromEntries(Object.entries(intermediateIds).map(([source, hash]) => ([hash, source])))

//   function annotateContract(source: Obj.Contract, dst: Core.Contract): Core.Contract {
//     if (CoreG.Close.is(dst) && ObjG.Close.is())
//   }

//   function annotateEntry(key: string, contract: Core.Contract): Core.Contract {
//     const sourceContractObject = source.objects.get(sourceMap[key] ?? '');
//     if (typeof sourceContractObject === "undefined") throw new Error(`Cant find source for ${key}`);
//     const sourceContract = sourceContractObject.value as Obj.Contract;

//     return contract;
//   }

//   return {
//     main: closure.main,
//     contracts: M.mapWithIndex(annotateEntry)(closure.contracts)
//   }
// }
