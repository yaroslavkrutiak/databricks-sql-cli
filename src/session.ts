import { DBSQLClient, LogLevel } from '@databricks/sql';
import { ConnectionOptions, OpenSessionRequest } from '@databricks/sql/dist/contracts/IDBSQLClient';

import { fail, info, warn } from './utils';

export type ConnectionConfig = {
  connectionConfig: ConnectionOptions;
  sessionConfig: Required<OpenSessionRequest>;
};

export default async function getSession({ connectionConfig, sessionConfig }: ConnectionConfig) {
  info(`Connecting to https://${connectionConfig.host}/${connectionConfig.path}`);

  const client = new DBSQLClient({
    logger: {
      log: (level: LogLevel, message: string) => {
        switch (level) {
          case LogLevel.info:
            info(message);
            break;
          case LogLevel.warn:
            warn(message);
            break;
          case LogLevel.error:
            fail(message);
        }
      },
    },
  });

  await client.connect(connectionConfig);
  const session = await client.openSession();

  await session.executeStatement(
    `CREATE SCHEMA IF NOT EXISTS ${sessionConfig.initialCatalog}.${sessionConfig.initialSchema}`
  );
  await session.executeStatement(
    `USE ${sessionConfig.initialCatalog}.${sessionConfig.initialSchema}`
  );

  return session;
}
