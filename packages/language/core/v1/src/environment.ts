import * as t from "io-ts/lib/index.js";
import { ISO8601, datetoIso8601, POSIXTime } from "@marlowe.io/adapter/time";

/**
 * @hidden
 */
// TODO: If this is supposed to be used by the end user it should be uncurried
export const mkEnvironment =
  (start: Date) =>
  (end: Date): Environment => ({
    timeInterval: { from: start.getTime(), to: end.getTime() },
  });

/**
 * TODO: Comment
 * @see Appendix E.16 of the {@link https://github.com/input-output-hk/marlowe/releases/download/v3/Marlowe.pdf | Marlowe spec}
 * @category Environment
 */
export interface TimeInterval {
  from: POSIXTime;
  to: POSIXTime;
}

/**
 * TODO: Comment
 * @see Appendix E.16 of the {@link https://github.com/input-output-hk/marlowe/releases/download/v3/Marlowe.pdf | Marlowe spec}
 * @category Environment
 */
export const TimeIntervalGuard: t.Type<TimeInterval> = t.type({
  from: POSIXTime,
  to: POSIXTime,
});

/**
 * TODO: Comment
 * @see Section 2.1.10 and appendix E.22 of the {@link https://github.com/input-output-hk/marlowe/releases/download/v3/Marlowe.pdf | Marlowe spec}
 * @category Environment
 */
export interface Environment {
  timeInterval: TimeInterval;
}

/**
 * TODO: Comment
 * @see Section 2.1.10 and appendix E.22 of the {@link https://github.com/input-output-hk/marlowe/releases/download/v3/Marlowe.pdf | Marlowe spec}
 * @category Environment
 */
export const EnvironmentGuard: t.Type<Environment> = t.type({
  timeInterval: TimeIntervalGuard,
});
