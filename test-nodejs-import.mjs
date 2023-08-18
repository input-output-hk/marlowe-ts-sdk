// NOTE: This file helps debug package loading in NodeJS. At some point it should be replaced by a separate
//       repository that tests the npm package directly.
//       Try this by running `node test-nodejs-import.mjs`
import {POSIXTime} from "@marlowe.io/legacy-adapter/time"
import {Close} from "@marlowe.io/language-core-v1"
import {mkRuntime} from "@marlowe.io/legacy-runtime"



console.log("POSIXTime", POSIXTime);
console.log("Close", Close);
console.log("mkRuntime", mkRuntime);

