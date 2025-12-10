import { WalletCurrency } from '../enums';


/**
 * Convert NGN to kobo (smallest currency unit)
 * @param ngnAmount Amount in NGN
 * @returns Amount in kobo
 */
export function ngnToKobo(ngnAmount: number): number {
  return Math.round(ngnAmount * 100);
}

/**
 * Convert kobo to NGN
 * @param koboAmount Amount in kobo
 * @returns Amount in NGN
 */
export function koboToNgn(koboAmount: number): number {
  return koboAmount / 100;
}

/**
 * Convert amount to smallest currency unit based on currency type
 * @param amount Amount in main currency unit
 * @param currency Currency type
 * @returns Amount in smallest currency unit
 */
export function toSmallestUnit(amount: number, currency: WalletCurrency): number {
  switch (currency) {
    case WalletCurrency.NGN:
      return ngnToKobo(amount);
    case WalletCurrency.USD:
      // 1 USD = 100 cents
      return Math.round(amount * 100);
    case WalletCurrency.EUR:
      // 1 EUR = 100 cents
      return Math.round(amount * 100);
    default:
      return Math.round(amount * 100);
  }
}

/**
 * Convert amount from smallest currency unit to main currency unit
 * @param smallestUnitAmount Amount in smallest currency unit
 * @param currency Currency type
 * @returns Amount in main currency unit
 */
export function fromSmallestUnit(smallestUnitAmount: number, currency: WalletCurrency): number {
  switch (currency) {
    case WalletCurrency.NGN:
      return koboToNgn(smallestUnitAmount);
    case WalletCurrency.USD:
      // 100 cents = 1 USD
      return smallestUnitAmount / 100;
    case WalletCurrency.EUR:
      // 100 cents = 1 EUR
      return smallestUnitAmount / 100;
    default:
      return smallestUnitAmount / 100;
  }
}

