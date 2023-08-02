

export const format = (lovelaces:bigint): String => new Intl.NumberFormat().format((lovelaces / 1_000_000n)).concat(" ₳");

