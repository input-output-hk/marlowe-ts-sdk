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

export async function annotatedClosure<T>(
  sourceObjectMap: ContractObjectMap<T>,
  lifecycle: RuntimeLifecycle
): Promise<ContractClosure> {
  debugger;
  const { contractSourceId, intermediateIds } =
    await lifecycle.restClient.createContractSources(
      stripContractBundleAnnotations(mapToContractBundle(sourceObjectMap))
    );

  const closure = await getContractClosure({ lifecycle })(contractSourceId);

  // The intermediateIds is an object whose keys belong to the source code and value is the merkle hash.
  // We need to reverse this object in order to annotate the closure using the source annotations.
  // It is possible for two different source entries to have the same hash and different annotations.
  // In that case the last annotation will prevail.
  const sourceMap = Object.fromEntries(
    Object.entries(intermediateIds).map(([source, hash]) => [hash, source])
  );

  function getSourceContract(ref: Obj.Label) {
    const sourceContractObject = sourceObjectMap.objects.get(ref);
    if (typeof sourceContractObject === "undefined")
      throw new Error(`Cant find source for ${ref}`);

    return sourceContractObject.value as Obj.Contract<unknown>;
  }

  function copyAnnotation<T extends object>(source: object, dst: T): T {
    if (isAnnotated(source)) {
      return { annotation: source.annotation, ...dst };
    }
    return dst;
  }

  function annotateContract(
    source: Obj.Contract<unknown>,
    dst: Core.Contract
  ): Core.Contract {
    let srcContract = source;
    if (ObjG.Reference.is(source)) {
      srcContract = getSourceContract(source.ref);
    }

    if (CoreG.Close.is(dst) && ObjG.Close.is(srcContract)) {
      return srcContract as Core.Close;
    }

    if (CoreG.Pay.is(dst) && ObjG.Pay.is(srcContract)) {
      return copyAnnotation(srcContract, {
        ...dst,
        then: annotateContract(srcContract.then, dst.then),
      });
    }

    if (CoreG.If.is(dst) && ObjG.If.is(srcContract)) {
      return copyAnnotation(srcContract, {
        ...dst,
        then: annotateContract(srcContract.then, dst.then),
        else: annotateContract(srcContract.else, dst.else),
      });
    }

    if (CoreG.Let.is(dst) && ObjG.Let.is(srcContract)) {
      return copyAnnotation(srcContract, {
        ...dst,
        then: annotateContract(srcContract.then, dst.then),
      });
    }

    if (CoreG.Assert.is(dst) && ObjG.Assert.is(srcContract)) {
      return copyAnnotation(srcContract, {
        ...dst,
        then: annotateContract(srcContract.then, dst.then),
      });
    }

    if (CoreG.When.is(dst) && ObjG.When.is(srcContract)) {
      const srcWhen = srcContract;
      return copyAnnotation(srcWhen, {
        ...dst,
        timeout_continuation: annotateContract(
          srcWhen.timeout_continuation,
          dst.timeout_continuation
        ),
        when: dst.when.map((dstCase, index) => {
          const srcCase = srcWhen.when[index];
          if ("merkleized_then" in srcCase) {
            throw new Error(`Merkleized not supported in source.`);
          }

          if ("then" in srcCase && "then" in dstCase) {
            return {
              ...dstCase,
              then: annotateContract(srcCase.then, dstCase.then),
            };
          } else {
            return dstCase;
          }
        }),
      });
    }

    throw new Error(`Cant annotate source contract.`);
  }

  function annotateEntry(key: string, contract: Core.Contract): Core.Contract {
    debugger;
    const sourceContract = getSourceContract(sourceMap[key]);
    return annotateContract(sourceContract, contract);
  }

  return {
    main: closure.main,
    contracts: M.mapWithIndex(annotateEntry)(closure.contracts),
  };
}
