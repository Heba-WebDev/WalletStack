import { MigrationInterface, QueryRunner } from 'typeorm';

export class SetDefaultCurrencyNgn1765366420863 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      UPDATE wallets
      SET currency = 'NGN'
      WHERE currency != 'NGN'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Rollback: We can't determine what the previous currency was for each wallet
    // This migration is one-way - if you need to rollback, you'd need to
    // restore from a backup or manually set currencies
    // For safety, we'll leave wallets as NGN
  }
}

