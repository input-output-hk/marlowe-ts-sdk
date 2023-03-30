

export const format = (lovelaces:BigInt): String => new Intl.NumberFormat().format((lovelaces.valueOf() / 1_000_000n)).concat(" ₳");

