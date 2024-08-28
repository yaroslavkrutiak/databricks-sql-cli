import IDBSQLSession from '@databricks/sql/dist/contracts/IDBSQLSession';
import { readFileSync } from 'fs';
import { join } from 'path';

import { fail, SQLString, success } from './utils';

type MigrationStatement = string;

export class Migration {
  private static read(name: string): string {
    const path = join(process.cwd(), 'migrations', name);
    return readFileSync(path, 'utf8');
  }

  private static processIntoStatements(sql: string): MigrationStatement[] {
    return sql.replace(/\n/g, ' ').split(';');
  }

  private _statements: MigrationStatement[] = [];

  private readonly _isApplied: Promise<boolean> = new Promise((resolve) => {
    this.isMigrationApplied(this.session, this.name).then((isApplied) => resolve(isApplied));
  });

  constructor(private readonly session: IDBSQLSession, private readonly migrationName: string) {
    this._statements = Migration.processIntoStatements(Migration.read(migrationName));
  }

  get name(): string {
    return this.migrationName;
  }

  get isApplied(): Promise<boolean> {
    return Promise.resolve(this._isApplied);
  }

  private async isMigrationApplied(session: IDBSQLSession, name: string) {
    const operation = await session.executeStatement(
      `
          SELECT * FROM _migrations WHERE name = ${SQLString(name)};
        `
    );
    const [migration] = await operation.fetchAll({ maxRows: 1 });

    if (!!migration && 'failed_reason' in migration && migration.failed_reason) {
      fail(
        `Cannot apply migrations because there is a failed migration ${name} with error: \n${migration.failed_reason}`
      );
    }
    return !!migration;
  }

  async apply() {
    for await (const statement of this._statements) {
      if (statement.trim()) {
        const operation = await this.session.executeStatement(statement);
        await operation.finished({
          progress: true,
          callback: async (progress) => {
            if (progress.errorMessage) {
              await this.markMigrationFailed(progress.displayMessage || 'Unknown error');
              fail(`Migration ${this.name} failed with error: \n${progress.displayMessage}`);
            }
          },
        });
      }
    }
    await this.markMigrationSuccessful();
    success(`Applied`);
  }

  private async markMigrationSuccessful() {
    const operation = await this.session.executeStatement(
      `
          INSERT INTO _migrations (
              name,
              finished_at
          ) VALUES (
              ${SQLString(this.name)},
              CURRENT_TIMESTAMP
          )
          `
    );
    await operation.finished();
  }

  private async markMigrationFailed(message: string) {
    const operation = await this.session.executeStatement(
      `
            INSERT INTO _migrations (
            name,
            failed_reason
            ) VALUES (
            ${SQLString(this.name)},
            ${SQLString(message)}
            )
        `
    );
    await operation.finished();
  }
}
