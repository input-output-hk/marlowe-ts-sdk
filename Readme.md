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

The **Marlowe TS-SDK** is a suite of _TypeScript/JavaScript_ libraries for developing Web-Dapp in the Cardano Blockchain using Marlowe Technologies.

It is composed of several npm packages documented in the [API reference](https://input-output-hk.github.io/marlowe-ts-sdk/) page.

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

## Examples

Inside the [pocs folder](./pocs/Readme.md) you can find a set of minimal examples on how to use different packages of the SDK.

- [wallet flow](./pocs/wallet-flow.html): Simple example on how to use the `@marlowe.io/wallet` package to connect to a wallet extension and get basic info.

More elaborate examples can be found in the following repositories:

- [marlowe-payouts](https://github.com/input-output-hk/marlowe-payouts)

# Development

To help in the development of this SDK, please refer to [this document](./doc/howToDevelop.md).
