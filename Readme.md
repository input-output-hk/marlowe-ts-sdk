<div align="left">
    <img src="./doc/image/logo.svg" alt="Logo" width="100" height="100">
</div>

Official Links

- Website : <a href="https://marlowe.iohk.io" > marlowe.iohk.io </a>
- Documentation :<a href="https://docs.marlowe.iohk.io" > docs.marlowe.iohk.io </a>
- Playground : <a href="https://play.marlowe.iohk.io" > play.marlowe.iohk.io </a>
- Blog : <a href="https://marlowe.iohk.io/blog" > marlowe.iohk.io/blog </a>
- Support : <a href="https://iohk.zendesk.com/hc/en-us/requests/new" > iohk.zendesk.com </a>

**Repository Status** : _Beta_ (Warning : Work still under progress)

# Overview

`marlowe-ts-sdk` is a suite of **TypeScript/JavaScript** libraries for Web Cardano Dapp Development using Marlowe Technologies.

It is composed of the following [npm workspaces](https://docs.npmjs.com/cli/v7/using-npm/workspaces) :

- Language
  - [@marlowe.io/language-core-v1](./packages/language/core/v1/)
    - Marlowe Core V1 constructs
    - JSON Codec
- Cardano Wallet
  - [@marlowe.io/wallet](./packages/runtime/core/)
    - Wallet Extension Capabalities (Browser / CIP-30)
    - Single Wallet Address Capabalities(NodeJS / Version used for e2e tests only)
- Runtime
  - [@marlowe.io/runtime-lifecycle](./packages/runtime/lifecycle/) : Entry Point for Running remotely Marlowe Contracts over a backend instance of the runtime using a connected wallet.
    - Marlowe Tx Commands
      - Create
      - Applying Inputs
      - Withdraws
    - Query capabilities for supporting these commands
  - [@marlowe.io/runtime-core](./packages/runtime/core/) : core concepts used throughout the runtime libraries.
  - [@marlowe.io/runtime-rest-client](./packages/runtime/client/rest/) : client of the runtime rest api.
- Infrastruture Supporting SubDomains
  - [@marlowe.io/adapter](./packages/adapter) : supporting set of libraries for Marlowe and Runtime Core Domains.

# Get Started

## Prerequesites

In order to start working with the Marlowe SDK you need to have a URL to a running instance of the Marlowe Runtime and one of the supported wallet extensions installed in your browser.

To get a running instance of the Runtime, it is recommended to check out the instructions on the [Marlowe Starter Kit](https://github.com/input-output-hk/marlowe-starter-kit)

## Wallet Extensions

### Compatible

- [Nami](https://namiwallet.io/)
- [Eternl](https://eternl.io/)

### Non Compatible

- Lace: TODO: add github issue with the current problem

### Non Tested

- TODO

## NPM

```bash
npm install @marlowe.io/adapter @marlowe.io/wallet @marlowe.io/language-core-v1 @marlowe.io/runtime @marlowe.io/runtime-core @marlowe.io/runtime-rest-client
```

## Basic usage

```
TODO
```

## Examples

Inside the [pocs folder](./pocs/Readme.md) you can find a set of minimal examples on how to use different packages of the SDK.

- [wallet flow](./pocs/wallet-flow.html): Simple example on how to use the `@marlowe.io/wallet` package to connect to a wallet extension and get basic info.

More elaborate examples can be found in the following repositories:

- [marlowe-payouts](https://github.com/input-output-hk/marlowe-payouts)

# Development

To help in the development of this SDK, please refer to [this document](./doc/howToDevelop.md).
