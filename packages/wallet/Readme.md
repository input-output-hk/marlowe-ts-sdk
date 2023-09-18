# Description

This package provides functionality to work with a CIP30 wallet.

It has the following modules:

- api: provides an abstract interface to work with a wallet.
- browser: provides a browser implementation of the api using the [CIP30 specification](https://cips.cardano.org/cips/cip30/).

[comment]: # "nodejs: provides a server implementation of the api using Lucid NOTE: the underlying library might be replaced in the future - for the momment disabled until we discuss the Node module"

## Getting started

The `@marlowe.io/wallet` package is [packaged as an ESM module](http://TODO-link-to-the-doc-file-in-gh.com) and requires the following peer dependencies:

### Browser


- [lucid-cardano](https://github.com/spacebudz/lucid): a library that provides a browser implementation of the CIP30 specification. Will likely be replaced by [Cardano SDK](https://github.com/input-output-hk/cardano-js-sdk/tree/master/packages/wallet) in the future (once they offer CBOR capabilities that replace the need for the WASM library).

```html
<script src="https://cdn.jsdelivr.net/gh/input-output-hk/marlowe-ts-sdk/jsdelivr-npm-importmap.js">
<script type="module">
  import { createBrowserWallet, getAvailableWallets } from "@marlowe.io/wallet";

  const availableWallets = getAvailableWallets();
  console.log(`Available wallets: ${availableWallets}`);
  const wallet = await createBrowserWallet(availableWallets[0]);
</script>
```

## POC

There is a simple HTML file in the [pocs folder](http://todo-full-link) that shows how to use the wallet package to connect to a wallet extension and get basic info.
