import { MigrationInterface, QueryRunner } from 'typeorm';

export class PaystackTransactions1765303520648 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS paystack_transactions (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        transaction_id UUID NOT NULL UNIQUE,
        paystack_reference VARCHAR(255) NOT NULL UNIQUE,
        paystack_transaction_id VARCHAR(255),
        authorization_url VARCHAR(500),
        paystack_status VARCHAR(50),
        webhook_received BOOLEAN NOT NULL DEFAULT FALSE,
        webhook_processed_at TIMESTAMP,
        webhook_signature VARCHAR(255),
        amount DECIMAL(15, 2) NOT NULL,
        currency wallet_currency NOT NULL DEFAULT 'NGN',
        customer_email VARCHAR(255),
        metadata JSONB,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (transaction_id) REFERENCES transactions(id)
      )
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_paystack_transactions_reference ON paystack_transactions (paystack_reference);
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_paystack_transactions_transaction_id ON paystack_transactions (transaction_id);
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_paystack_transactions_webhook_received ON paystack_transactions (webhook_received);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS paystack_transactions;`);
  }
}

