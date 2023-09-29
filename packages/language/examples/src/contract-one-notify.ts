/* eslint-disable sort-keys-fix/sort-keys-fix */

import { Contract, close, Timeout } from "@marlowe.io/language-core-v1";

/**
 * Marlowe Example : A contract with One Step (one true notify)
 */

export const oneNotifyTrue: (notifyTimeout: Timeout) => Contract = (
  notifyTimeout
) => ({
  when: [{ case: { notify_if: true }, then: close }],
  timeout: notifyTimeout,
  timeout_continuation: close,
});
