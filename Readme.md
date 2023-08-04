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
