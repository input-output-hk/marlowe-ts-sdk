
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
  "blockfrostNetwork": "Preprod",
  // You can create this seed phrase from any wallet. Do not reuse a real wallet phrase
  // for a test example.
  "seedPhrase": "alpha beta delta..."
}
```

Finally you can run the examples

```bash
$ npm run wallet-flow
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
  "type": "module",
}
```
