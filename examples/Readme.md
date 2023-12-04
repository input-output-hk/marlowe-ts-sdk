## Overview

The examples on this folder demonstrate how to run the different packages within a simple HTML page.

## How to run

### Prerequisites

- A CIP30 wallet (Nami, Eternl or Lace) installed on the browser.
- [Node.js](https://nodejs.org/en/) installed on your machine.

### Flow

Make sure that you have development dependencies installed:

```bash
npm install
```

Then run the following command to start a local server:

```bash
npm run serve
```

The previous command will start a local server on port 1337 and with the latest published libraries. If you want to use the local version instead, run the following command:

```bash
npm run build
npm run serve-dev
```

Then select one of the available examples:

- [wallet flow](./wallet-flow/): Simple example on how to use the `@marlowe.io/wallet` package to connect to a wallet extension and get basic info and to manually sign transactions.
- [Survey workshop](./survey-workshop/participant): A small excercise to create a Survey Marlowe contract.

[//]: # "TODO: Explain other examples"
