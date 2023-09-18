# Description

The Marlowe Lifecycle package contains code to query, create and interact with the Marlowe Contracts associated with a given wallet. In other words, it let you interact with "your" contracts.

## Getting started

The `@marlowe.io/lifecycle` package is [released as an ESM module](https://github.com/input-output-hk/marlowe-ts-sdk/blob/main/doc/modules-system.md) and can be used with a modern bundler or imported directly in the browser (without any bundler) as long as you use an import map.

### Browser

```html
<html>
  <body>
    <script src="https://cdn.jsdelivr.net/gh/input-output-hk/marlowe-ts-sdk/jsdelivr-npm-importmap.js"></script>
    <script type="module">
      import * as L from "@marlowe.io/runtime-lifecycle";
      console.log("TODO", L);
      debugger;
    </script>
  </body>
</html>
```
