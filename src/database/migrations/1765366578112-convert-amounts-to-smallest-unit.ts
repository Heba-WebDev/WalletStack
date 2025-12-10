import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Migration to convert all amounts from main currency units (NGN) to smallest units (kobo)
 * This ensures accuracy by storing amounts as integers instead of decimals
 * 
 * For NGN: 1 NGN = 100 kobo
 * For USD: 1 USD = 100 cents
 * For EUR: 1 EUR = 100 cents
 */
export class ConvertAmountsToSmallestUnit1765366578112 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Step 1: Convert existing wallet balances from NGN to kobo (multiply by 100)
    // Also handles USD/EUR (multiply by 100 for cents)
    await queryRunner.query(`
      UPDATE wallets
      SET balance = ROUND(balance * 100)::bigint
      WHERE balance IS NOT NULL
    `);

    // Step 2: Convert existing transaction amounts from main currency to smallest unit
    await queryRunner.query(`
      UPDATE transactions
      SET amount = ROUND(amount * 100)::bigint
      WHERE amount IS NOT NULL
    `);

    // Step 3: Convert existing paystack_transaction amounts from main currency to smallest unit
    await queryRunner.query(`
      UPDATE paystack_transactions
      SET amount = ROUND(amount * 100)::bigint
      WHERE amount IS NOT NULL
    `);

    // Step 4: Change column types from DECIMAL to BIGINT
    // Wallets balance
    await queryRunner.query(`
      ALTER TABLE wallets
      ALTER COLUMN balance TYPE BIGINT USING balance::bigint
    `);

    // Transactions amount
    await queryRunner.query(`
      ALTER TABLE transactions
      ALTER COLUMN amount TYPE BIGINT USING amount::bigint
    `);

    // Paystack transactions amount
    await queryRunner.query(`
      ALTER TABLE paystack_transactions
      ALTER COLUMN amount TYPE BIGINT USING amount::bigint
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Step 1: Change column types back to DECIMAL
    await queryRunner.query(`
      ALTER TABLE wallets
      ALTER COLUMN balance TYPE DECIMAL(10, 2) USING (balance::numeric / 100.0)
    `);

    await queryRunner.query(`
      ALTER TABLE transactions
      ALTER COLUMN amount TYPE DECIMAL(15, 2) USING (amount::numeric / 100.0)
    `);

    await queryRunner.query(`
      ALTER TABLE paystack_transactions
      ALTER COLUMN amount TYPE DECIMAL(15, 2) USING (amount::numeric / 100.0)
    `);

    // Step 2: Convert amounts back from smallest unit to main currency (divide by 100)
    await queryRunner.query(`
      UPDATE wallets
      SET balance = balance / 100.0
      WHERE balance IS NOT NULL
    `);

    await queryRunner.query(`
      UPDATE transactions
      SET amount = amount / 100.0
      WHERE amount IS NOT NULL
    `);

    await queryRunner.query(`
      UPDATE paystack_transactions
      SET amount = amount / 100.0
      WHERE amount IS NOT NULL
    `);
  }
}

