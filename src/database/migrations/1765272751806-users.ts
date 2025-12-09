import { MigrationInterface, QueryRunner } from "typeorm";

export class Users1765272751806 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS users (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                google_id VARCHAR(255) NOT NULL UNIQUE,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) NOT NULL UNIQUE,
                avatar_url VARCHAR(255),
                created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
                deleted_at TIMESTAMP NULL
            )
        `);

        await queryRunner.query(`
            CREATE OR REPLACE FUNCTION set_users_updated_at()
            RETURNS TRIGGER AS $$
            BEGIN
                NEW.updated_at = NOW();
                RETURN NEW;
            END;
            $$ LANGUAGE plpgsql;
        `);

        await queryRunner.query(`
            CREATE TRIGGER trg_users_updated_at
            BEFORE UPDATE ON users
            FOR EACH ROW
            EXECUTE FUNCTION set_users_updated_at();
        `);

        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS idx_user_email ON users (email);
        `);

        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS idx_users_google_id ON users (google_id);
        `);
    }


    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP TRIGGER IF EXISTS trg_users_updated_at ON users;
        `);

        await queryRunner.query(`
            DROP FUNCTION IF EXISTS set_users_updated_at;
        `);

        await queryRunner.query(`
            DROP INDEX IF EXISTS idx_users_google_id;
        `);
        await queryRunner.query(`
            DROP INDEX IF EXISTS idx_user_email;
        `);

        await queryRunner.query(`
            DROP TABLE IF EXISTS users;
        `);
    }

}
