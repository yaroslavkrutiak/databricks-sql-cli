import { OpenSessionRequest } from '@databricks/sql/dist/contracts/IDBSQLClient';
import IDBSQLSession from '@databricks/sql/dist/contracts/IDBSQLSession';
import { existsSync, mkdirSync, readdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import { createInterface } from 'readline';

import { Migration } from './migration';
import { fail, promptAndWaitForAnswer, success } from './utils';

export class MigrationManager {
  private readonly _migrationsDirPath = join(process.cwd(), 'migrations');

  constructor(private readonly session: IDBSQLSession) {}

  init(options?: { failOnExists?: boolean }) {
    const exists = existsSync(this._migrationsDirPath);
    if (exists) {
      options?.failOnExists && fail('Migrations folder already exists');
    } else {
      mkdirSync(this._migrationsDirPath);
      success('Migrations folder created');
    }
  }

  create(name: string) {
    this.init({ failOnExists: false });
    const timestamp = Date.now();
    const migrationName = `${timestamp}_${name}.sql`;
    const migrationPath = join(this._migrationsDirPath, migrationName);
    writeFileSync(migrationPath, '', 'utf8');
    success(`Migration created: ${migrationName} at ${this._migrationsDirPath}`);
  }

  async apply(session: IDBSQLSession) {
    const dirents = readdirSync('migrations', { withFileTypes: true });

    const migrations: Migration[] = [];

    console.group(`Scanning for migrations found:`);
    for await (const entry of dirents) {
      const isMigrationFile = entry.isFile() && entry.name.endsWith('.sql');
      const migration = new Migration(session, entry.name);
      const isToBeApplied = !(await migration.isApplied);
      console.info(
        `Migration: ${entry.name} ${isToBeApplied ? 'is to be applied' : 'already applied'}`
      );
      isMigrationFile && isToBeApplied && migrations.push(migration);
    }
    console.groupEnd();

    if (migrations.length === 0) {
      success('All migrations already applied, nothing to apply');
      return;
    }

    console.group(`Applying migrations:`);
    for await (const migration of migrations) {
      console.info(`Migration: ${migration.name}`);
      await migration.apply();
    }

    console.groupEnd();
    success('All migrations applied successfully');
  }

  async reset({ initialCatalog, initialSchema }: Required<OpenSessionRequest>) {
    const rl = createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    const shouldReset = await promptAndWaitForAnswer({
      rl,
      question: 'Are you sure you want to reset the schema? (yes/no): ',
      resolver: (answer) => answer.toLowerCase() === 'yes',
    });

    rl.close();

    if (!shouldReset) {
      success('Schema reset cancelled');
      return false;
    }

    success('Schema reset confirmed');
    await this.dropSchema(`${initialCatalog}.${initialSchema}`);
    await this.createSchema(`${initialCatalog}.${initialSchema}`);

    return true;
  }

  async createMigrationsTableIfNotExists() {
    const operation = await this.session.executeStatement(
      `
            CREATE TABLE IF NOT EXISTS _migrations (
              name STRING NOT NULL PRIMARY KEY,
              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
              finished_at TIMESTAMP,
              failed_reason STRING
            )
            USING DELTA
            TBLPROPERTIES (
                'delta.feature.allowColumnDefaults' = 'supported'
            );
          `
    );
    await operation.finished();
  }

  private async dropSchema(schema: string) {
    try {
      const dropSchemaQuery = `DROP SCHEMA IF EXISTS ${schema} CASCADE`;
      const dropSchemaOperation = await this.session.executeStatement(dropSchemaQuery);
      await dropSchemaOperation.finished();
    } catch (error) {
      fail('Error dropping schema:', error);
    }
  }

  private async createSchema(schema: string) {
    try {
      const createSchemaQuery = `CREATE SCHEMA IF NOT EXISTS ${schema}`;
      const createSchemaOperation = await this.session.executeStatement(createSchemaQuery);
      await createSchemaOperation.finished();
    } catch (error) {
      fail('Error creating schema:', error);
    }
  }
}
