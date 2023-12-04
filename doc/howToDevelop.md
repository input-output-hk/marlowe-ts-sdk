# Development

## Build

In order to start develop the SDK you need to install the dependencies and build the packages.

```
$ npm i
$ npm run build
```

If you want to build a single package you can use the `-w` flag or execute the build command from the package folder.

```
# From the root folder
$ npm run build -w @marlowe.io/language-core-v1
# Or you can enter the package and build
$ cd packages/language/core/v1
$ npm run build
```

In order to clean the build artifacts you can use the `clean` command.

```
$ npm run clean
```

To run the unit test you can execute the `test` command.

```
$ npm run test
```

## E2E tests

In order to run the E2E tests you need to create a `./env/.env.test` file that points to a working version of the Marlowe runtime and a working Blockfrost instance and a faucet PK.

If you haven't done it before, go to https://blockfrost.io/ and create a free-tier account. Then, create a project and copy the project ID. Blockfrost is a Lucid dependency, eventually when
we migrate to a different library this wont be necessary.

To create an instance of a local Marlowe runtime, follow the instructions in the [Marlowe starter kit](https://github.com/input-output-hk/marlowe-starter-kit/blob/main/docs/preliminaries.md)

TODO: explain how to get the Faucet PK

```
MARLOWE_WEB_SERVER_URL="http://<path-to-runtime>:33294/"
BLOCKFROST_PROJECT_ID="<blockfrost-id>"
BLOCKFROST_URL="https://cardano-preprod.blockfrost.io/api/v0"
NETWORK_ID=Preprod
BANK_PK_HEX='<pk>'
```

## Documentation

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

### Changelogs

This project manages its changelog with [scriv](https://github.com/nedbat/scriv). PRs are automatically checked to see if there's a new entry in the `./changelog.d` folder. If a PR doesn't need a changelog entry, a `No Changelog Required` label can be added to disable the check.

Create a new changelog entry template with

```
$ scriv create
```

edit the new file with appropriate content for your PR and commit it. Read [the documentation for scriv](https://scriv.readthedocs.io/en) to learn more about how to use this tool.

To collect all changelog entries into a single file, execute `std` from the nix shell and run the `build-changelog` script. This command will delete all entries from the `changelog.d` folder and update the `CHANGELOG.md` file.

## Publish

For the moment the SDK is manually published to npm. Task PLT-6939 captures the work to automate this process through the CI.

Before publishing it's convenient to verify that the artifacts works as expected :

- Clean & Build

```bash
$ npm run clean && npm run build
```

- Test

```bash
$ npm t && npm run test:e2e
```

- Check the packages
  To test this you can pack all the different packages into tarballs using

```bash
$ npm --workspaces pack --pack-destination dist
```

And in a separate project you can install the tarballs using a file url when declaring the dependency

```json
{
  "dependencies": {
    "@marlowe.io/runtime-lifecycle": "file:<path-to-dist>/marlowe.io-runtime-lifecycle-0.2.0-beta.tgz",
    "@marlowe.io/runtime-rest-client": "file:<path-to-dist>/marlowe.io-runtime-rest-client-0.2.0-beta.tgz",
    "@marlowe.io/adapter": "file:<path-to-dist>/marlowe.io-adapter-0.2.0-beta.tgz",
    "@marlowe.io/runtime-core": "file:<path-to-dist>/marlowe.io-runtime-core-0.2.0-beta.tgz",
    "@marlowe.io/language-core-v1": "file:<path-to-dist>/marlowe.io-language-core-v1-0.2.0-beta.tgz",
    "@marlowe.io/language-examples": "file:<path-to-dist>/marlowe.io-language-examples-0.2.0-beta.tgz",
    "@marlowe.io/wallet": "file:<path-to-dist>/marlowe.io-wallet-0.2.0-beta.tgz"
  }
}
```

TODO [[Publish pre-check]] Local map and this pack instructions
TODO instructions on how to manually publish
In order to check that the export/import mechanism works on the browser using import maps you can:

1. Create a testing branch in a fork of the repo
1. Clean and build the project `npm run clean && npm run build`
1. Remove `dist` from `.gitignore`
1. Commit the `dist` folders of the different packages
1. Get the full git hash of the commit using `git rev-parse HEAD`
1. Publish the branch in your fork
1. Modify `rollup/config.mjs` and set the correct `owner` and `version` when we build the import map for jsdelivr-gh.
1. Rebuild the project `npm run build`
1. Modify the html in the `pocs` folder to use `/dist/jsdelivr-gh-importmap.js`
1. From the root folder run `npx http-server --port 1337 -c-1  -o ./`
1. Verify that each poc example works properly.
