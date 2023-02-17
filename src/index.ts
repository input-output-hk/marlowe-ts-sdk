import axios, { AxiosInstance, AxiosResponse } from 'axios';

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
  roles: null, // FIXME: We ignore roles for now
  version: Version,
  metadata: {}, //
  minUtXoDeposit: number, // V1.Ada
  changeAddress: Bech32, // Bech32
  addresses: Bech32[], // Array Bech32
  collateralUTxOs: Bech32[], // TxOutRef
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
        const config = {
          data: input
        };

        return request.post(route as string, config);
      }
    },
    contract: {
      get: async (route: ContractEndpoint) => {
        return request.get(route as string)
      }
    }
  }
}

const axiosRequest = axios.create({
    baseURL: 'http://0.0.0.0:49172',
    headers: { ContentType: 'application/json', Accept: 'application/json' }
});

const client = MarloweRuntimeClient(axiosRequest);

// Ugly fetcher for all the contracts
const foldContracts = async () => {
  let result:ContractHeaderItem[] = [];
  let step = async function(response: GetContractsResponse | ErrorResponse) {
    if(typeof response === "number") {
      console.log("Error: ", response);
    } else {
      result.push(...response.items)
      if (response.nextRange) {
        await step(await client.contracts.get(contractsEndpoint, { range: response.nextRange }));
      }
    }
  }
  let response = await client.contracts.get(contractsEndpoint)
  await step(response)
  return result;
}

foldContracts().then(contracts => console.log(contracts.length));

