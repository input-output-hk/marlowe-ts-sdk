import * as t from "io-ts";
import { ISO8601, datetoIso8601 } from "../../../../adapter/time";



export const mkEnvironment : (validityStart:Date) => (validityEnd:Date) => Environment 
    = (start) => (end) => ({ validityStart: datetoIso8601(start), validityEnd: datetoIso8601(end)}) 

export type Environment = t.TypeOf<typeof Environment>
export const Environment 
  = t.type(
      { validityStart: ISO8601
      , validityEnd: ISO8601
    })