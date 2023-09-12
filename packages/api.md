The **Marlowe TypeScript SDK** is a suite of **TypeScript/JavaScript** libraries for Web Cardano Dapp Development using Marlowe Technologies.

It is composed of the following packages:

- Language
  - [@marlowe.io/language-core-v1](./modules/_marlowe_io_language_core_v1.html)
    - Marlowe Core V1 constructs
    - JSON Codec
- Cardano Wallet
  - [@marlowe.io/wallet](./modules/_marlowe_io_wallet.html)
    - Wallet Extension Capabalities (Browser / CIP-30)
    - Single Wallet Address Capabalities(NodeJS / Version used for e2e tests only)
- Runtime
  - [@marlowe.io/runtime-lifecycle](./modules/_marlowe_io_runtime_lifecycle.html) : Entry Point for Running remotely Marlowe Contracts over a backend instance of the runtime using a connected wallet.
    - Marlowe Tx Commands
      - Create
      - Applying Inputs
      - Withdraws
    - Query capabilities for supporting these commands
  - [@marlowe.io/runtime-core](./modules/_marlowe_io_runtime_core.html) : core concepts used throughout the runtime libraries.
  - [@marlowe.io/runtime-rest-client](./modules/_marlowe_io_runtime_rest_client.html) : client of the runtime rest api.
- Infrastruture Supporting SubDomains
  - [@marlowe.io/adapter](./modules/_marlowe_io_adapter.html) : supporting set of libraries for Marlowe and Runtime Core Domains.
