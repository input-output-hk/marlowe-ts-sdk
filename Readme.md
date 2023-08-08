# Marlowe TS-SDK
TODO

## Developer notes

### Build

To build all packages

```
$ npm run build
```

To build a single package
```
# From the root folder
$ npm run build -w @marlowe/language-core-v1
# Or you can enter the package and build
$ cd packages/language/core/v1
$ npm run build
```

To clean all packages

```
$ npm run clean
```


TODO migrage
    "test": "yarn node --experimental-vm-modules $(yarn bin jest -c ./jest.config.js)"


### Run tests


In order to run the E2E tests you need to create a `env/.env.test` file that points to a working version of the marlowe runtime and a working Blockfrost instance and a faucet PK

TODO: explain how to get the Faucet PK

```
MARLOWE_WEB_SERVER_URL="http://<path-to-runtime>:33294/"
BLOCKFROST_PROJECT_ID="<blockfrost-id>"
BLOCKFROST_URL="https://cardano-preprod.blockfrost.io/api/v0"
NETWORK_ID=Preprod
BANK_PK_HEX='<pk>'
```

### Documentation

> ⚠ You need to [build the packages](#build) before you can compile the documentation!

To compile all documentation

```
$ npm run docs
```

Documentation is built with [TypeDoc](https://typedoc.org), published through [GitHub Pages](https://pages.github.com), and hosted at https://input-output-hk.github.io/marlowe-ts-sdk

Each sub project needs a `typedoc.json` file in the sub project root directory as specified in the `workspaces` field in `./packages.json`. For example, there's some project "some-project" specified:

```json
// ./packages.json
{
  ...,
  "workspaces": ["./path/to/some-project"]
}
```

There needs to be a `typedoc.json` in `./path/to/some-project` and it needs properties along the lines of this example:

```json
// ./path/to/some-project/typedoc.json
{
  "entryPointStrategy": "expand",
  "entryPoints": ["./src"],
  "tsconfig": "./tsconfig.json"
}
```
