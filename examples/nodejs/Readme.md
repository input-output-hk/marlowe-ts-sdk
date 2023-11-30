
# Using this example
To use this repo just run

```bash
$ npm install
$ TODO
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
