import axios, { AxiosInstance, AxiosResponse } from 'axios';

// API responses brings us back URLs so we are encouraged to not construct them manually.
// We use a opaque string to represent URLs for that.
//
// Opaque types idiom (like a hidden `newtype` constructor in Haskell)
declare const ContractsEndpoint: unique symbol;

type ContractsEndpoint = string & {_opaque: typeof ContractsEndpoint};

declare const ContractEndpoint: unique symbol;

type ContractEndpoint = string & {_opaque: typeof ContractEndpoint};

declare const TransactionsEndpoint: unique symbol;

type TransactionsEndpoint = string & {_opaque: typeof TransactionsEndpoint};

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

export interface ErrorResponse {
  status: "400" | "404" | "500";
}

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
  resource: ContractHeader;
  links: { contract: ContractEndpoint }
}

export interface GetContractsResponse {
  nextRange?: string,
  prevRange?: string,
  contracts: ContractHeaderItem[];
};

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



export interface MarloweRuntime {
  contracts: {
    get: (
      input?: GetContractsRequestOptions
    ) => Promise<AxiosResponse<GetContractsResponse | ErrorResponse>>;
    // post: (
    //   input: CreateBookOptions
    // ) => Promise<AddBook201Response | ErrorResponse>;
  },
  // n"/contracts/{contractId}/": {}
};

export function MarloweRuntimeClient(request: AxiosInstance): MarloweRuntime {
  return {
    contracts: {
      get: (route: ContractsEndpoint, input?: GetContractsRequestOptions) => {
        return request.get(route as string, input);
      }
      post: (route: ContractsEndpoint, input: PostContractsRequestOptions) => {
        return request.post(route as string, input);
      }
    }
  }
}

export const api = "/contracts" as ContracatsEndpoint;


const axiosRequest = axios.create({
    baseURL: 'http://0.0.0.0:49172',
    headers: { ContentType: 'application/json', Accept: 'application/json' }
});

const client = MarloweRuntimeClient(axiosRequest);

client.contracts.get().then(response => {
  console.log(response);
});
