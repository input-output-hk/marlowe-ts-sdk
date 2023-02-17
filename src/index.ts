import axios, { AxiosInstance } from 'axios';

// API responses brings us back URLs so we are encouraged to not construct them manually.
// We use a opaque string to represent URLs for that.
//
// Opaque types idiom (like a hidden `newtype` constructor in Haskell)
declare const ContractsEndpoint: unique symbol;

type ContractsEndpoint = string & {_opaque: typeof ContractsEndpoint};

declare const ContractEndpoint: unique symbol;

// It seems like overengeeniring to have a root endpoint defined like this
// but we gonna extend the API and it gonna be served as a part of root response.
export const contractsEndpoint = "/contracts" as ContractsEndpoint;

type ContractEndpoint = string & {_opaque: typeof ContractEndpoint};

// We are cheating in here a bit by hardcoding URLs ;-)
export const contractEndpoint = (contractId: string) => `/contracts/${contractId}` as ContractEndpoint;

declare const TransactionsEndpoint: unique symbol;

type TransactionsEndpoint = string & {_opaque: typeof TransactionsEndpoint};

export const transactionsEndpoint = (contractId: string) => `/contracts/${contractId}/transactions` as TransactionsEndpoint;

declare const TransactionEndpoint: unique symbol;

type TransactionEndpoint = string & {_opaque: typeof TransactionEndpoint};

export const transactionEndpoint = (contractId: string, transactionId: string) =>
  `/contracts/${contractId}/transactions/${transactionId}` as TransactionEndpoint;

export interface GetContractsRequestOptions {
  range?: string
}

type Bech32 = string;

type Version = "v1";

// Just a stub for Marlowe Contract and State
type Contract = "close";
type State = any;

export interface PostContractsRequest {
  contract: Contract,
  roles?: any // RolesConfig
  version?: Version,
  metadata?: Record<number, Object>,
  minUTxODeposit: number,
  changeAddress: Bech32,
  addresses?: Bech32[], // When skipped we use `[changeAddress]`
  collateralUTxOs?: Bech32[]
}

// Currently the runtime API doesn't provide any additional information
// beside the error status code like 400, 404, 500 etc.
type ErrorResponse = number;

type TxOutRef = string;
type PolicyId = string;
type Status = "unsigned" | "submitted" | "confirmed";

interface BlockHeader {
  slotNo: number, // These should be BigInts
  blockNo: number,
  blockHeaderHash: string
}

interface ContractHeader {
  contractId: TxOutRef,
  roleTokenMintingPolicyId: PolicyId,
  version: Version,
  metadata?: Record<number, Object> // FIXME
  status: Status
  blockHeader?: BlockHeader
}

interface ContractHeaderItem {
  results: ContractHeader;
  links: { contract: ContractEndpoint }
}

interface IndexResponse<Response> {
  nextRange?: string,
  prevRange?: string,
  items: Response[]
}

export type GetContractsResponse = IndexResponse<ContractHeaderItem>;

export interface PostContractsResponse {
  contractId: TxOutRef,
  endpoint: ContractEndpoint,
  // This contains a CBOR of the `TxBody`. The REST API gonna be extended so
  // we can also fetch a whole Transaction (CIP-30 `signTx` expects actually a whole `Tx`).
  txBody: TextEnvelope
}

interface TextEnvelope {
  type: string,
  description?: string,
  cborHex: string
};

interface ContractState extends ContractHeader {
  initialContract: Contract
  currentContract?: Contract
  state?: State
  utxo?: TxOutRef
  txBody?: TextEnvelope
}

export interface MarloweRuntimeApi {
  contracts: {
    get: (
      route: ContractsEndpoint,
      input?: GetContractsRequestOptions
    ) => Promise<GetContractsResponse | ErrorResponse>;
    post: (
      route: ContractsEndpoint,
      input: PostContractsRequest
    ) => Promise<PostContractsResponse | ErrorResponse>;
  },
  contract: {
    get: (route: ContractEndpoint) => Promise<ContractState | ErrorResponse>
  }
};

export function MarloweRuntimeClient(request: AxiosInstance): MarloweRuntimeApi {
  return {
    contracts: {
      get: async (route: ContractsEndpoint, input) => {
        const config = input?.range?{ headers: { Range: input.range } } : {};

        return request.get(route as string, config)
          .then(response => {
            return {
              items: response.data.results,
              nextRange: response.headers["next-range"],
              prevRange: response.headers["prev-range"]
            };
          })
          .catch(error => error.status);
      },
      post: async (route: ContractsEndpoint, input: PostContractsRequest) => {
        const data = {
          contract: input.contract,
          roles: input.roles ?? null,
          version: input.version ?? "v1",
          metadata: input.metadata ?? {},
          minUTxODeposit: input.minUTxODeposit,
        };
        const config = {
          headers: {
            "X-Change-Address": input.changeAddress,
            "X-Address": (input.addresses??[input.changeAddress]).join(","),
            ... input.collateralUTxOs && { "X-Collateral-UTxOs": input.collateralUTxOs},
          }
        };
        return request.post(route as string, data, config).then(response => {
          return {
            contractId: response.data.resource.contractId,
            txBody: response.data.resource.txBody,
            endpoint: response.data.links.contract
          };
        }).catch(error => error.status);
      }
    },
    contract: {
      get: async (route: ContractEndpoint) => {
        return request.get(route as string).then(response => {
          // We are getting back { links: {}, resource: contractState } here
          return response.data.resource;
        }).catch(error => error.status);
      }
    }
  }
}

// Just a temporary quick and dirty tests of the client
const port = process.argv[2];

if(!port) {
  console.error("Please provide a runtime port number as an argument");
  process.exit(1);
}

const axiosRequest = axios.create({
    baseURL: `http://0.0.0.0:${port}`,
    headers: { ContentType: 'application/json', Accept: 'application/json' }
});

const client = MarloweRuntimeClient(axiosRequest);

// Ugly fetcher for all the contracts
const foldContracts = async (filterItem: ((item: ContractHeaderItem) => boolean)) => {
  let result:ContractHeaderItem[] = [];
  let step = async function(response: GetContractsResponse | ErrorResponse) {
    if(typeof response === "number") {
      console.log("Error: ", response);
    } else {
      result.push(...response.items.filter(filterItem))
      if (response.nextRange) {
        await step(await client.contracts.get(contractsEndpoint, { range: response.nextRange }));
      }
    }
  }
  let response = await client.contracts.get(contractsEndpoint)
  await step(response)
  return result;
}

foldContracts(() => true).then(contracts => console.log(contracts.length));

let address = "addr_test1qz4y0hs2kwmlpvwc6xtyq6m27xcd3rx5v95vf89q24a57ux5hr7g3tkp68p0g099tpuf3kyd5g80wwtyhr8klrcgmhasu26qcn";

client.contracts.post(
  contractsEndpoint,
  { contract: "close"
  , minUTxODeposit: 2000000
  , changeAddress: address
  }
).then(function(response) {
  console.log(response);
  if(typeof response === "number") {
    console.log("Error: ", response);
  } else {
    client.contract.get(response.endpoint).then(function(response) {
      console.log(response);
    });
  }
});
