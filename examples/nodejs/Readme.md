# Using this example

To use this example you first need to install dependencies and build the code

```bash
$ npm install
$ npm run build
```

Then you need to create a `.config.json` file with the following content

```jsonc
{
  // We use blockfrost for the lucid wallet, you can create a projectId here
  // https://blockfrost.io/
  "blockfrostProjectId": "YOUR_PROJECT_ID",
  "blockfrostUrl": "https://cardano-preprod.blockfrost.io/api/v0",
  "network": "Preprod",
  // You can create this seed phrase from any wallet. Do not reuse a real wallet phrase
  // for a test example.
  "seedPhrase": "alpha beta delta...",
  "runtimeURL": "<url to a runtime instance>"
}
```

Finally you can run the examples

```bash
# Wallet flow example
$ npm run wallet-flow
# Escrow flow example
$ npm run escrow -- \
  --sell-to addr_xxx \
  -a 10000000 \
  --mediator addr_yyy
```

## Setting up a new Node.JS project that uses the TS-SDK

When you create a new Node.js project that uses the TS-SDK you need to install the desire packages

```bash
$ npm i @marlowe.io/language-core-v1 @marlowe.io/wallet
```

Make sure that the `package.json` is define as an ESM module

```jsonc
{
  //...
  "type": "module"
}
```
