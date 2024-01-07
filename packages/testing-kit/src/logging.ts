export const logInfo = (message: string) => console.log(`## ${message}`);
export const logWarning = (message: string) =>
  console.log(`## << ${message} >>`);
export const logError = (message: string) =>
  console.log(`## !! [${message}] !!`);
