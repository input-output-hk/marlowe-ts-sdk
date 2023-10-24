## Overview

The examples on this folder demonstrate how to run the different libraries within a simple HTML page.

## How to run

### Using Chrome

#### Prerequisites

- A CIP30 wallet  (Nami, Eternl or Lace) installed on the browser.

#### Flow

At the root of the project :

```bash
npx http-server --port 1337 -c-1  -o ./
```

Then select one of the availble examples:

- [wallet flow](./wallet-flow/): Simple example on how to use the `@marlowe.io/wallet` package to connect to a wallet extension and get basic info and to manually sign transactions.
- [Rest client flow](./rest-client-flow/): Shows how to use the `@marlowe.io/runtime-rest-client` package.

[//]: # (TODO: Explain other examples)
