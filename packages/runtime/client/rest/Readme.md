# Description

The `runtime-rest-client` package provides a JS API to interact with the [runtime REST API](https://docs.marlowe.iohk.io/api/introduction). It is intended to work with version `0.0.5` of the API.

The main {@link index | module} exposes the {@link index.mkFlatRestClient} function, which returns an instance of a {@link index.RuntimeFlatApi}.

## Getting started

The `@marlowe.io/runtime-rest-client` package is [released as an ESM module](https://github.com/input-output-hk/marlowe-ts-sdk/blob/main/doc/modules-system.md) and can be used with a modern bundler or imported directly in the browser (without any bundler) as long as you use an import map.

### Browser

```html
<html>
  <body>
    <script src="https://cdn.jsdelivr.net/gh/input-output-hk/marlowe-ts-sdk/jsdelivr-npm-importmap.js">
    </script>
    <script type="module">
      import { mkRestClient } from "@marlowe.io/runtime-rest-client";
      // TODO

    </script>
  </body>
</html>
```
