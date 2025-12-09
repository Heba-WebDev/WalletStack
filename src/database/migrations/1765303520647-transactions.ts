import { MigrationInterface, QueryRunner } from 'typeorm';

export class Transactions1765303520647 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // transaction_type enum
    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'transaction_type') THEN
          CREATE TYPE transaction_type AS ENUM ('deposit', 'transfer');
        END IF;
      END
      $$;
    `);

    // transaction_status enum
    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'transaction_status') THEN
          CREATE TYPE transaction_status AS ENUM ('pending', 'success', 'failed');
        END IF;
      END
      $$;
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS transactions (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        type transaction_type NOT NULL,
        amount DECIMAL(15, 2) NOT NULL,
        status transaction_status NOT NULL DEFAULT 'pending',
        reference VARCHAR(255) UNIQUE,
        sender_wallet_id UUID,
        recipient_wallet_id UUID NOT NULL,
        description TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (sender_wallet_id) REFERENCES wallets(id),
        FOREIGN KEY (recipient_wallet_id) REFERENCES wallets(id)
      )
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_transactions_reference ON transactions (reference);
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions (type);
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions (status);
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions (created_at);
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_transactions_sender_wallet_id ON transactions (sender_wallet_id);
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_transactions_recipient_wallet_id ON transactions (recipient_wallet_id);
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_transactions_wallet_lookup ON transactions (sender_wallet_id, recipient_wallet_id);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS transactions;`);
    await queryRunner.query(`DROP TYPE IF EXISTS transaction_type;`);
    await queryRunner.query(`DROP TYPE IF EXISTS transaction_status;`);
  }
}

