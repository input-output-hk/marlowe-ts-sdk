import * as path from "path";
import * as fs from "fs";
import { MarloweTheme } from "./MarloweTheme";

import { Application, JSX, RendererEvent } from "typedoc";

/**
 * Called by TypeDoc when loaded as a plugin.
 */
export function load(app: Application) {
  app.renderer.hooks.on("body.begin", (_) => (
    <script>
      <JSX.Raw html="console.log(`Loaded ${location.href}`)" />
    </script>
  ));

  app.listenTo(app.renderer, RendererEvent.END, (event: RendererEvent) => {
    const src = path.join(__dirname, "..", "assets");
    const dest = path.join(event.outputDirectory, "assets", "marlowe");
    copySync(src, dest);
  });
  app.renderer.defineTheme("marlowe-theme", MarloweTheme);

  app.renderer.hooks.on("head.end", (event) => (
    <>
      <link rel="icon" href={event.relativeURL("assets/marlowe/favicon.ico")} />
      <link
        rel="stylesheet"
        href={event.relativeURL("assets/marlowe/marlowe-theme.css")}
      />
    </>
  ));

  app.renderer.hooks.on("body.end", (event) => (
    <script>
      <JSX.Raw
        html={
          /* js */ `
          try {
            const generateLinkElement = document.querySelector(".tsd-generator a");
            const link = document.createElement("a");
            Object.assign(link, {
              href: "https://github.com/input-output-hk/marlowe-ts-sdk",
              target: "_blank",
              rel: "noreferrer",
              innerText: "marlowe-theme."
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

export function copySync(src: string, dest: string): void {
  const stat = fs.statSync(src);

  if (stat.isDirectory()) {
    const contained = fs.readdirSync(src);
    contained.forEach((file) =>
      copySync(path.join(src, file), path.join(dest, file))
    );
  } else if (stat.isFile()) {
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(src, dest);
  } else {
    // Do nothing for FIFO, special devices.
  }
}
