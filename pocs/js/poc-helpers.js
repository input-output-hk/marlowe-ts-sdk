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

export function getRuntimeUrl() {
  const runtimeUrlInput = document.getElementById("runtimeUrl");
  return runtimeUrlInput.value || "http://localhost:32952";
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
