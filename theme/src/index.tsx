import { cpSync } from "node:fs";
import { resolve } from "node:path";
import { MarloweTheme } from "./MarloweTheme";

import { Application, JSX, RendererEvent } from "typedoc";


/**
 * Called by TypeDoc when loaded as a plugin.
 */
export function load(app: Application) {
  app.renderer.hooks.on('body.begin', (_) => (
    <script>
      <JSX.Raw html="console.log(`Loaded ${location.href}`)" />
    </script>
  ));

  app.renderer.hooks.on("head.end", (event) => (
    <>
      <link
        rel="stylesheet"
        href={event.relativeURL("assets/marlowe-theme.css")}
      />
    </>
  ));

  app.listenTo(app.renderer, RendererEvent.END, () => {
    const from = resolve(__dirname, '../assets/style.css');
    const to = resolve(app.options.getValue('out'), 'assets/marlowe-theme.css');
    cpSync(from, to);
  });
  app.renderer.defineTheme('marlowe-theme', MarloweTheme);

  app.renderer.hooks.on("body.end", (event) => (
    <script>
      <JSX.Raw
        html={
          /* js */ `
          try {
            const generateLinkElement = document.querySelector(".tsd-generator a");
            const link = document.createElement("a");
            Object.assign(link, {
              href: "https://github.com/dmnsgn/typedoc-material-theme",
              target: "_blank",
              rel: "noreferrer",
              innerText: "typedoc-material-theme."
            });
            generateLinkElement.insertAdjacentElement("afterend", link);
            generateLinkElement.insertAdjacentText("afterend", " with ");
          } catch (error) {

          }
        `
        }
      />
    </script>
  ));
}