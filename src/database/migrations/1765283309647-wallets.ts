import { MigrationInterface, QueryRunner } from "typeorm";

export class Wallets1765283309647 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DO $$
            BEGIN
                IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'wallet_currency') THEN
                    CREATE TYPE wallet_currency AS ENUM ('NGN', 'USD', 'EUR');
                END IF;
            END
            $$;
        `);

        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS wallets (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                number VARCHAR(255) NOT NULL UNIQUE,
                balance DECIMAL(10, 2) NOT NULL DEFAULT 0,
                currency wallet_currency NOT NULL,
                is_active BOOLEAN NOT NULL DEFAULT TRUE,
                user_id UUID NOT NULL,
                created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                CONSTRAINT uq_wallet_user UNIQUE (user_id),
                FOREIGN KEY (user_id) REFERENCES users(id)
            )
        `);

        await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_wallet_number ON wallets (number);`);

        await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_wallet_user_id ON wallets (user_id);`);        
        
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE IF EXISTS wallets;`);
        await queryRunner.query(`DROP TYPE IF EXISTS wallet_currency;`);
        await queryRunner.query(`DROP INDEX IF EXISTS idx_wallet_number;`);
        await queryRunner.query(`DROP INDEX IF EXISTS idx_wallet_user_id;`);
    }

}
