import { ConfigModule, ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import {
  TypeOrmModuleAsyncOptions,
  TypeOrmModuleOptions,
} from '@nestjs/typeorm';
import { join } from 'path';
import AppConfig from './config';
import { usePGlite, useNoDatabase } from './config/database.config';

// Conditionally import PGliteDriver only when needed.
// Fail-fast if DATABASE_TYPE=pglite but the driver can't load -- never silently
// fall back to a postgres connection that will ECONNREFUSED in WebContainer.
let PGliteDriver: any;
if (usePGlite) {
  try {
    PGliteDriver = require('typeorm-pglite').PGliteDriver;
  } catch (e) {
    throw new Error(
      'DATABASE_TYPE is set to "pglite" but typeorm-pglite failed to load. ' +
      'Make sure typeorm-pglite and @electric-sql/pglite are installed.\n' +
      `Original error: ${e instanceof Error ? e.message : e}`
    );
  }
}

// Support both DB_SSL and DATABASE_SSL env vars (Lambda uses DATABASE_SSL)
const sslEnabled = process.env.DB_SSL === 'true' || process.env.DATABASE_SSL === 'true';
const sslConfig = sslEnabled
  ? {
      ssl: true,
      extra: {
        ssl: {
          rejectUnauthorized: false,
        },
      },
    }
  : {};

// Build ORM config based on database type (null if DATABASE_TYPE=none)
const ormConfig = useNoDatabase
  ? null
  : {
      type: AppConfig.database?.type as any,
      // PGlite uses driver injection instead of connection details
      // PGLITE_DATA_DIR enables file-based persistence (needed for multi-step CLI workflows
      // like schema:sync followed by migration:generate). Without it, PGlite is in-memory
      // and data is lost when the process exits.
      ...(usePGlite && PGliteDriver
        ? { driver: new PGliteDriver(process.env.PGLITE_DATA_DIR || undefined).driver }
        : {
            host: AppConfig.database?.host,
            port: parseInt(AppConfig.database?.port || '5432', 10),
            username: AppConfig.database?.username,
            database: AppConfig.database?.database,
            password: AppConfig.database?.password,
            schema: AppConfig.database?.schema,
            ...sslConfig,
          }),
      entities: [join(__dirname, '**', '*.entity.js')],
      migrations: [join(__dirname, '**', 'migrations/*-migration.js')],
      synchronize: AppConfig.database?.synchronize ?? false,
      logging: AppConfig.database?.logging ?? false,
    };

export const typeOrmAsyncConfig: TypeOrmModuleAsyncOptions | null = useNoDatabase
  ? null
  : {
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (): Promise<TypeOrmModuleOptions> => {
        console.log('ORM CONFIG', { ...ormConfig, driver: usePGlite ? '[PGliteDriver]' : undefined });
        if (usePGlite) {
          console.log('Using PGlite in-memory database');
        }
        return ormConfig!;
      },
    };

// Export flag for app.module.ts to conditionally include TypeOrmModule
export { useNoDatabase };

// Only create DataSource if we have a config
export default useNoDatabase ? null : new DataSource(ormConfig!);
