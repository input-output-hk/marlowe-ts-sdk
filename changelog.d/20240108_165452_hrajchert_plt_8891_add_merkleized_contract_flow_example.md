
### General

- Feat: Added debugging configuration for VSCode. Now if you are developing with VSCode you can open the folder as a workspace and the [Javascript Debug Terminal](https://code.visualstudio.com/docs/nodejs/nodejs-debugging#_javascript-debug-terminal) will have the appropiate source maps. ([PR#136](https://github.com/input-output-hk/marlowe-ts-sdk/pull/136)).
- Feat: Started an experimental getApplicableActions that should replace the current getApplicableInputs. ([PR#136](https://github.com/input-output-hk/marlowe-ts-sdk/pull/136))

### Examples
- Feat: Added a new interactive NodeJs example to make delayed payments with staking and merkleization. ([PR#136](https://github.com/input-output-hk/marlowe-ts-sdk/pull/136))


### @marlowe.io/adapter

- Feat: Added a bigint utilities adapter. ([PR#136](https://github.com/input-output-hk/marlowe-ts-sdk/pull/136))
- Feat: Added iso8601ToPosixTime to the time adapter. ([PR#136](https://github.com/input-output-hk/marlowe-ts-sdk/pull/136))

### @marlowe.io/language-core-v1

- Feat: Added SingleInputTx to capture a single step transaction (either a single input or an empty tx). ([PR#136](https://github.com/input-output-hk/marlowe-ts-sdk/pull/136)).
- Feat: Added getNextTimeout to see what is the next timeout of a contract.  ([PR#136](https://github.com/input-output-hk/marlowe-ts-sdk/pull/136)).
- Fix: Fix how merkleized inputs are serialized


### @marlowe.io/runtime-rest-client

- [Breaking Change] Refactor: Create contract sources now uses a single parameter ContractBundle, instead of two separate bundle and main entrypoint parameters. ([PR#136](https://github.com/input-output-hk/marlowe-ts-sdk/pull/136))
- [Breaking change] Fix: Pagination responses not always return a current header.  ([PR#136](https://github.com/input-output-hk/marlowe-ts-sdk/pull/136))

### @marlowe.io/runtime-lifecycle

- Feat: Added restClient to the lifecycle object for easier querying. ([PR#136](https://github.com/input-output-hk/marlowe-ts-sdk/pull/136))
- Feat: Added getInputHistory to get a list of SingleInputTx applied to a contract. ([PR#136](https://github.com/input-output-hk/marlowe-ts-sdk/pull/136))

### @marlowe.io/marlowe-object

- Feat: Added ContractBundle to represent a bundle with a main entrypoint. ([PR#136](https://github.com/input-output-hk/marlowe-ts-sdk/pull/136))
