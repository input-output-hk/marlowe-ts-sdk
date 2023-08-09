import * as t from "io-ts";
import { Observation } from "../../common/observations.js";

export type Notify = { notify_if: Observation }

export const Notify : t.Type<Notify>
  = t.recursion('Notify', () =>
    t.type ({ notify_if: Observation }))
