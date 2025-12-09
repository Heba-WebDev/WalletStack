export function generateWalletNumber(): string {
  const prefix = 'WST';
  // Generate a 10-digit number (1000000000 to 9999999999)
  const min = 1000000000;
  const max = 9999999999;
  const walletNumber = Math.floor(Math.random() * (max - min + 1)) + min;
  return `${prefix}${walletNumber.toString()}`;
}

