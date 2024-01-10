import { Address } from "@marlowe.io/language-core-v1";

export const splitAddress = ({ address }: Address) => {
  const halfLength = Math.floor(address.length / 2);
  const s1 = address.substring(0, halfLength);
  const s2 = address.substring(halfLength);
  return [s1, s2];
};
