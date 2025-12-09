import 'reflect-metadata';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { DataSource, DataSourceOptions } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

dotenv.config();

const sslEnabled = process.env.DB_SSL === 'true';
const shouldRunMigrations = process.env.DB_MIGRATIONS_RUN !== 'false';

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST ?? 'localhost',
  port: Number(process.env.DB_PORT ?? 5432),
  username: process.env.DB_USERNAME ?? 'postgres',
  password: process.env.DB_PASSWORD ?? 'postgres',
  database: process.env.DB_NAME ?? 'walletstack',
  synchronize: false,
  migrationsRun: shouldRunMigrations,
  logging: process.env.DB_LOGGING === 'true',
  entities: [
    path.join(__dirname, '..', 'entities', '**', '*.{ts,js}'),
    path.join(__dirname, '..', 'modules', '**', 'models', '*.{ts,js}'),
  ],
  migrations: [path.join(__dirname, 'migrations', '*.{ts,js}')],
  namingStrategy: new SnakeNamingStrategy(),
  ssl: sslEnabled
    ? {
        rejectUnauthorized:
          process.env.DB_SSL_REJECT_UNAUTHORIZED === 'true' ? true : false,
      }
    : false,
};

export const AppDataSource = new DataSource(dataSourceOptions);

