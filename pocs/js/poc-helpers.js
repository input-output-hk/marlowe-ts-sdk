import { MarloweJSON } from "@marlowe.io/adapter/codec";
export function clearConsole() {
  const consoleDiv = document.getElementById("console");
  consoleDiv.innerHTML = "";
}

export function log(message) {
  const consoleDiv = document.getElementById("console");
  var currentContent = consoleDiv.innerHTML;
  consoleDiv.innerHTML = currentContent + "<BR>" + message;
  console.log(message);
}

export function logJSON(message, json) {
  const consoleDiv = document.getElementById("console");
  var currentContent = consoleDiv.innerHTML;
  consoleDiv.innerHTML = `${currentContent}<BR>${message}<pre>${MarloweJSON.stringify(
    json,
    null,
    4
  )}</pre>`;
  console.log(message, json);
}

export function getRuntimeUrl() {
  const runtimeUrlInput = document.getElementById("runtimeUrl");
  return (
    runtimeUrlInput.value ||
    "https://marlowe-runtime-preprod-web.scdev.aws.iohkdev.io/"
  );
}

export function setupLocalStorageRuntimeUrl() {
  const runtimeUrlInput = document.getElementById("runtimeUrl");
  const runtimeUrl = localStorage.getItem("runtimeUrl");
  if (runtimeUrl) {
    runtimeUrlInput.value = runtimeUrl;
  }
  runtimeUrlInput.addEventListener("change", () => {
    localStorage.setItem("runtimeUrl", runtimeUrlInput.value);
  });
}
