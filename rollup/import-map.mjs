import { buildRollupInput, getAllPackageInfo } from "./package-helper.mjs";
import * as A from "fp-ts/lib/Array.js";
import * as R from "fp-ts/lib/Record.js";
import * as O from "fp-ts/lib/Option.js";
import { pipe } from "fp-ts/lib/function.js";
import path from "path";
import { fileURLToPath } from "url";
import { promises as fs } from "fs";

/**
 * This function creates an import map object for the given packagesInfo.
 * @param packagesInfo All the packages infos as returned by getAllPackageInfo
 * @param importUrlBuilder A function that takes a packageInfo and a flatImportName and returns the URL for the import. It allows
 *                         to build import maps for different scenarios, e.g. local development, jsdelivr-npm, jsdelivr-gh
 * @see https://github.com/WICG/import-maps#the-basic-idea
 */
function buildImportMapObject(packagesInfo, importUrlBuilder ) {
  // We get the import map entries from the package definition
  const marloweIoImports = pipe(
    packagesInfo,
    // For each package in the exports definition (taken from package.json) there is a
    // corresponding import map. `packagesInfo` is an array of package information, so we
    // need to flatten the Array of Arrays with chain
    A.chain((pkg) => {
      return pipe(
        pkg.exports,
        R.toArray,
        // Search [[Glob exports problem]]
        A.filter(([exportKey, exportMap]) => !exportKey.includes("*")),
        // For each exported module we need to create an entry in the import map
        A.map(([exportKey, exportMap]) => {
          // Keys in the export definition are either "." or "./<module-name>"
          const flatImportName =
             exportKey === "." ? pkg.name : exportKey.replace(/^\.\//, "");

          const importMapKey = `@marlowe.io/${path.join(pkg.name, exportKey)}`;
          const importMapValue = importUrlBuilder(pkg, flatImportName)

          return [importMapKey, importMapValue];
        })
      );
    }),
    R.fromEntries
  );
  // External dependencies are added manually
  marloweIoImports["lucid-cardano"] =
    "https://unpkg.com/lucid-cardano@0.10.7/web/mod.js";
  return marloweIoImports;
}

/**
 * Creates an import map script. External import maps are not yet supported by browsers, so we create
 * a script that creates the import map at runtime.
 *
 * @param packagesInfo All the packages infos as returned by getAllPackageInfo
 * @param importFrom The source of the imports, it is an object with a type "local", "jsdelivr-npm"
 *                   or "jsdelivr-gh". In case of jsdelivr-npm or jsdelivr-gh the version is required.
 */
export async function buildImportMapScript (packagesInfo, importFrom, distFolder) {
  let outputFile, importMapObject;

  if (importFrom.type === "local") {
    const importUrlBuilder = (pkg, flatImportName) =>
          path.join(
            "/",
            pkg.location,
            "dist",
            "bundled",
            "esm",
            `${flatImportName}.js`
          );
    outputFile = path.join(distFolder, "local-importmap.js");
    importMapObject = buildImportMapObject(packagesInfo, importUrlBuilder);
  } else if (importFrom.type === "jsdelivr-gh") {
    const importUrlBuilder = (pkg, flatImportName) =>
      path.join(
            `https://cdn.jsdelivr.net/gh/${importFrom.owner}/marlowe-ts-sdk@${importFrom.version}/`,
            pkg.location,
            "dist",
            "bundled",
            "esm",
            `${flatImportName}.js`
          );
    outputFile = path.join(distFolder, "jsdelivr-gh-importmap.js");
    importMapObject = buildImportMapObject(packagesInfo, importUrlBuilder);
  } else if (importFrom.type === "jsdelivr-npm") {
    const importUrlBuilder = (pkg, flatImportName) =>
      path.join(
            `https://cdn.jsdelivr.net/npm/@marlowe.io/${pkg.name}@${importFrom.version}/`,
            "dist",
            "bundled",
            "esm",
            `${flatImportName}.js`
          );
    outputFile = path.join(distFolder, "jsdelivr-npm-importmap.js");
    importMapObject = buildImportMapObject(packagesInfo, importUrlBuilder);
  }

  fs.writeFile(outputFile, `const importMap = ${JSON.stringify({imports: importMapObject}, "", 2)};\nconst im = document.createElement('script');\nim.type = 'importmap';\nim.textContent = JSON.stringify(importMap);\ndocument.currentScript.after(im);`);
}
