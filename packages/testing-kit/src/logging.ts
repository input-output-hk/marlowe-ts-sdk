export const logInfo = (message: string) => console.log(`\t## - ${message}`);
export const logWarning = (message: string) =>
  console.log(`\t## << ${message} >>`);
export const logError = (message: string) =>
  console.log(`\t## !! [${message}] !!`);
