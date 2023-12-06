# Marlowe Runner End-To-End testing

## Running

Run the tests:

```bash
./run_tests.sh @dev
```

## Wallets

Artifacts needed to install wallets for testing are found in [artifacts](artifacts).
Currently available are _Lace_ and _Nami_. The testing wallets are setup
by either setting the `localStorage` in the Chrome browser or importing the
wallet by entering the mnemonic.
