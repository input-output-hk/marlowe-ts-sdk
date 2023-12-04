# 0.2.0-beta - 04 Dec 2023

## General

- Reformat code with [prettier](https://prettier.io/) and [alejandra](https://github.com/kamadorueda/alejandra) using the [treefmt](https://github.com/numtide/treefmt-nix) tool

- Improved the way the SDK gets imported in the browser by the use of importmaps. Included import documentation in each package.

- Renamed the global `pocs` folder to `examples`

- Fix url generation on the import maps.

- Introduced the @marlowe.io/marlowe-object package to facilitate the creation of large contracts using Merkleization.

- Added typedoc documentation.

## @marlowe.io/wallet

- Renamed the `pocs/runtimeCIP30Flow.html` to `pocs/wallet-flow.html` and modified it to highlight the wallet capabilities.

- **BREAKING CHANGE:** Removed `fp-ts` from the user facing API.
- **BREAKING CHANGE:** In the browser module `getExtensionInstance` was renamed to `mkBrowserWallet`

- **BREAKING CHANGE**: Renamed signTxTheCIP30Way to signTx

- **BREAKING CHANGE**: Refactored getNetworkCIP30 to isMainnet

- Added lace to supported wallets

- Added `getInstalledWalletExtensions` instead of `getAvalaibleWallets`

## @marlowe.io/language-core-v1

- Moved the examples to the `@marlowe.io/language-examples` package.

- **BREAKING CHANGE**: Modify the exported modules to have the JSON types in the main export and the runtime validations under a `/guards` module.

- Added a compatibility mode for the Playground's `marlowe-js` internal library. This is exported under the `@marlowe.io/language-core-v1/playground-v1` module.

- Add `computeTransaction` and `playTrace` semantics

## @marlowe.io/language-examples

- Add Survey example

- Added Vesting Contract

## @marlowe.io/runtime-rest-client

- **BREAKING CHANGE**: Replaced mkRestClient interface for a flat API that resembles the backend documentation structure.

- modified the `next` endpoint to be compliant with `runtime-web v0.0.5.1`

- Added the endpoint `createContractSources`

- Removed filter from return on `getContracts` endpoint

## @marlowe.io/runtime-lifecycle

- **BREAKING CHANGE:** Removed `fp-ts` from the user facing API

- Fixed `this undefined` issues when calling `mkRuntimeLifecycle`

- Lower the abstraction level of `ContractLifecyleAPI`

- An API consumer may retrieve all contract ids for contracts that mentions their users wallet addresses with method `getContractIds`.
