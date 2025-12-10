import { MigrationInterface, QueryRunner } from 'typeorm';

export class AuditLogs1765349098599 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'audit_log_actor_type') THEN
          CREATE TYPE audit_log_actor_type AS ENUM ('user', 'api_key');
        END IF;
      END
      $$;
    `);

    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'audit_log_action_type') THEN
          CREATE TYPE audit_log_action_type AS ENUM (
            'deposit_created',
            'deposit_success',
            'deposit_failed',
            'transfer_created',
            'transfer_success',
            'transfer_failed',
            'webhook_received',
            'webhook_processed'
          );
        END IF;
      END
      $$;
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        actor_type audit_log_actor_type NOT NULL,
        actor_id UUID NULL,
        action_type audit_log_action_type NOT NULL,
        target_entity VARCHAR(100) NOT NULL,
        target_id UUID NULL,
        metadata JSONB NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        -- Note: actor_id can reference either users or api_keys
        -- Foreign key constraints are not enforced at DB level
        -- Application handles the relationship based on actor_type
      );
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_audit_logs_actor_type ON audit_logs (actor_type);
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_audit_logs_actor_id ON audit_logs (actor_id);
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_audit_logs_action_type ON audit_logs (action_type);
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_audit_logs_target_entity ON audit_logs (target_entity);
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_audit_logs_target_id ON audit_logs (target_id);
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs (created_at);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS audit_logs;`);
    await queryRunner.query(`DROP TYPE IF EXISTS audit_log_action_type;`);
    await queryRunner.query(`DROP TYPE IF EXISTS audit_log_actor_type;`);
  }
}

