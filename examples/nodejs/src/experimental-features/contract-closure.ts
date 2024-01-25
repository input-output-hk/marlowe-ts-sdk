import { Contract } from "@marlowe.io/language-core-v1";
import { ContractSourceId } from "@marlowe.io/marlowe-object";
import { RuntimeLifecycle } from "@marlowe.io/runtime-lifecycle/api";

export interface ContractClosure {
  main: string;
  contracts: Map<string, Contract>;
}

type ClosureDI = { lifecycle: RuntimeLifecycle };

// TODO: Candidate for runtime lifecycle helper
export const getContractClosure =
  ({ lifecycle }: ClosureDI) =>
  async (contractSourceId: ContractSourceId): Promise<ContractClosure> => {
    const ids = await lifecycle.restClient.getContractSourceClosure({
      contractSourceId,
    });
    const objectEntries = await Promise.all(
      ids.results.map((id) =>
        lifecycle.restClient
          .getContractSourceById({ contractSourceId: id })
          .then((c) => [id, c] as const)
      )
    );
    return {
      main: contractSourceId,
      contracts: new Map(objectEntries),
    };
  };
