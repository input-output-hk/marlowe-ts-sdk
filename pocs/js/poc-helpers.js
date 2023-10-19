import { MarloweJSON } from "@marlowe.io/adapter/codec";
import { mkRuntimeLifecycle } from "@marlowe.io/runtime-lifecycle/browser";
import { mkRestClient } from "@marlowe.io/runtime-rest-client";
import { mkBrowserWallet, getAvailableWallets } from "@marlowe.io/wallet";

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
    window.restClient = null;
    window.runtimeLifecycle = null;
  });
}

export function setupClearConsole() {
  const clearConsoleButton = document.getElementById("clear-console");
  clearConsoleButton.addEventListener("click", clearConsole);
}

export function setupWallet() {
  const walletInput = document.getElementById("wallet");
  const availableWallets = getAvailableWallets();
  if (availableWallets.length === 0) {
    const option = document.createElement("option");
    option.value = "invalid";
    option.text = "No wallet available";
    walletInput.add(option);
    walletInput.disabled = true;
  } else {
    availableWallets.forEach((walletName) => {
      const option = document.createElement("option");
      option.value = walletName;
      option.text = walletName.charAt(0).toUpperCase() + walletName.slice(1);
      walletInput.add(option);
    });
  }
  walletInput.addEventListener("change", () => {
    window.restClient = null;
    window.runtimeLifecycle = null;
  });
}

export function getWallet() {
  const walletInput = document.getElementById("wallet");
  const walletName = walletInput.value;
  return mkBrowserWallet(walletName);
}

export function getRestClient() {
  if (typeof window.restClient == "undefined" || window.restClient == null) {
    const runtimeURL = getRuntimeUrl();
    window.restClient = mkRestClient(runtimeURL);
  }
  return window.restClient;
}

export async function getLifecycle() {
  if (
    typeof window.runtimeLifecycle == "undefined" ||
    window.runtimeLifecycle == null
  ) {
    const walletInput = document.getElementById("wallet");
    const walletName = walletInput.value;
    const runtimeURL = getRuntimeUrl();

    window.runtimeLifecycle = await mkRuntimeLifecycle({
      walletName,
      runtimeURL,
    });
  }
  return window.runtimeLifecycle;
}

export function setContractIdIndicator(
  contractId,
  indicatorId,
  network = "preprod"
) {
  const contractIdIndicator = document.getElementById(indicatorId);
  contractIdIndicator.innerHTML = contractId;
  const url = `https://${network}.marlowescan.com/contractView?tab=state&contractId=${contractId.replace(
    "#",
    "%23"
  )}`;
  contractIdIndicator.href = url;
  contractIdIndicator.target = "_blank";
}

export function tryCatchEvent(handler) {
  return async (...args) => {
    try {
      await handler(...args);
    } catch (e) {
      log(
        `<span style="color: red">Error:</span><br><pre>${e}</pre><br>Open the browser's console and network tab for more details`
      );
      throw e;
    }
  };
}
