## Marlowe Typedoc Theme

Theme for typedoc is done through a plugin that expands upon the default theme and allows JSX hooks/overrides to modify DOM.

Configurations for running this can be found in the root `package.json` file where `npm run docs` will run typedoc with configurations found in `typedoc.json`.

Typedoc's [example demo theme](https://github.com/Gerrit0/typedoc-custom-theme-demo) shows how various hooks are called within `index.tsx`. This entrypoint also contains a sync script for processing files in `/assets`.

Elements that are replaced from the default theme can be found under `/templates`. Additional templates can be added for more granular control (See toolbar as an example).

To build the theme:

```
npm run build
```

This creates a `/dist` directory which is configured by `typedoc.json` as the plugin. Continue to build the docs `npm run docs` from the directory root, then preview any changes locally with `npm run serve`.
