import { DataSource } from 'typeorm';
import { join } from 'path';
import AppConfig from './config';

(async () => {
  console.log('Database config: \n');
  const db: any = {
    type: AppConfig.database.type as any,
    host: AppConfig.database.host,
    port: parseInt(AppConfig.database.port, 10),
    username: AppConfig.database.username,
    database: AppConfig.database.database,
    password: AppConfig.database.password,
    schema: AppConfig.database.schema,
    synchronize: AppConfig.database.synchronize,
    logging: AppConfig.database.logging,
    entities: [join(__dirname, '**','*.entity.ts')],
  };
  // The password stays out of the log.
  console.log({ ...db, password: db.password ? '***' : undefined });
  const PostgresDataSource = new DataSource(db);
  try {
    await PostgresDataSource.initialize();
    console.log('Data Source has been initialized!');
    await PostgresDataSource.synchronize();
    console.log('Data Source has been synchronized!');
  } catch (err) {
    console.error('Error during Data Source synchronization');
    console.error(err);
    // A failed sync must fail the command, so CI and scripts see it.
    process.exitCode = 1;
  } finally {
    if (PostgresDataSource.isInitialized) await PostgresDataSource.destroy();
  }
})();
