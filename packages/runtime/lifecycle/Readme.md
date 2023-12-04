# Description

The Marlowe Lifecycle package contains code to query, create and interact with the Marlowe Contracts associated with a given wallet. In other words, it let you interact with "your" contracts.

## Getting started

The `@marlowe.io/lifecycle` package is [released as an ESM module](https://github.com/input-output-hk/marlowe-ts-sdk/blob/main/doc/modules-system.md) and can be used with a modern bundler or imported directly in the browser (without any bundler) as long as you use an import map.

### Browser

```html
<html>
  <body>
    <script src="https://cdn.jsdelivr.net/gh/input-output-hk/marlowe-ts-sdk@0.2.0-beta/jsdelivr-npm-importmap.js"></script>
    <script type="module">
      import { mkRuntimeLifecycle } from "@marlowe.io/runtime-lifecycle/browser";
      const walletName = "nami";
      const runtimeURL = "http://localhost:32788";

      console.log(
        `<h2>Connecting the runtime instance at ${runtimeURL} and the ${walletName} Wallet Extension</h2>`
      );
      const runtimeLifecycle = await mkRuntimeLifecycle({
        walletName: walletName,
        runtimeURL: runtimeURL,
      });
      console.log("");
      console.log("Connected to runtime...");
      console.log("");

      const avalaiblePayouts = await runtimeLifecycle.payouts
        .available()
        .catch((err) =>
          log(`Error while retrieving availaible payouts : ${err}`)
        );
      console.log(`nbPayouts retrieved : ${avalaiblePayouts.length}`);
      console.log("Payouts flow done 🎉");
    </script>
  </body>
</html>
```
