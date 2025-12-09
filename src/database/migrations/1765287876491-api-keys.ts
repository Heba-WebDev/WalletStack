import { MigrationInterface, QueryRunner } from 'typeorm';

export class ApiKeys1765287876491 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS api_keys (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                user_id UUID NOT NULL,
                key_hash VARCHAR(255) NOT NULL UNIQUE,
                key_prefix VARCHAR(20) NOT NULL,
                name VARCHAR(255) NOT NULL,
                expires_at TIMESTAMP NOT NULL,
                revoked_at TIMESTAMP NULL,
                parent_key_id UUID NULL,
                last_used_at TIMESTAMP NULL,
                created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (parent_key_id) REFERENCES api_keys(id) ON DELETE SET NULL
            )
        `);

    await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS api_key_permissions (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                api_key_id UUID NOT NULL,
                permission VARCHAR(50) NOT NULL,
                created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (api_key_id) REFERENCES api_keys(id) ON DELETE CASCADE
            )
        `);

    await queryRunner.query(`
            CREATE OR REPLACE FUNCTION set_api_keys_updated_at()
            RETURNS TRIGGER AS $$
            BEGIN
                NEW.updated_at = NOW();
                RETURN NEW;
            END;
            $$ LANGUAGE plpgsql;
        `);

    await queryRunner.query(`
            CREATE TRIGGER trg_api_keys_updated_at
            BEFORE UPDATE ON api_keys
            FOR EACH ROW
            EXECUTE FUNCTION set_api_keys_updated_at();
        `);

    await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS idx_api_keys_user_id ON api_keys (user_id);
        `);

    await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS idx_api_keys_key_hash ON api_keys (key_hash);
        `);

    await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS idx_api_keys_expires_at ON api_keys (expires_at);
        `);

    await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS idx_api_keys_revoked_at ON api_keys (revoked_at);
        `);

    await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS idx_api_keys_active 
            ON api_keys (user_id, revoked_at, expires_at);
        `);

    await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS idx_api_key_permissions_api_key_id 
            ON api_key_permissions (api_key_id);
        `);

    await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS idx_api_key_permissions_permission 
            ON api_key_permissions (permission);
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            DROP TRIGGER IF EXISTS trg_api_keys_updated_at ON api_keys;
        `);

    await queryRunner.query(`
            DROP FUNCTION IF EXISTS set_api_keys_updated_at;
        `);

    await queryRunner.query(`
            DROP INDEX IF EXISTS idx_api_keys_active;
        `);

    await queryRunner.query(`
            DROP INDEX IF EXISTS idx_api_keys_revoked_at;
        `);

    await queryRunner.query(`
            DROP INDEX IF EXISTS idx_api_keys_expires_at;
        `);

    await queryRunner.query(`
            DROP INDEX IF EXISTS idx_api_keys_key_hash;
        `);

    await queryRunner.query(`
            DROP INDEX IF EXISTS idx_api_keys_user_id;
        `);

    await queryRunner.query(`
            DROP INDEX IF EXISTS idx_api_key_permissions_permission;
        `);

    await queryRunner.query(`
            DROP INDEX IF EXISTS idx_api_key_permissions_api_key_id;
        `);

    await queryRunner.query(`
            DROP TABLE IF EXISTS api_key_permissions;
        `);

    await queryRunner.query(`
            DROP TABLE IF EXISTS api_keys;
        `);
  }
}

