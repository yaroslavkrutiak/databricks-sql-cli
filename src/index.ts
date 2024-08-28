#!/usr/bin/env node
import yargs from 'yargs';

import { Command } from './constants';
import { MigrationManager } from './migration-manager';
import getSession from './session';
import { fail, getArguments, isValidCommand, loadConfig } from './utils';

const args = getArguments();

const command = args._[0];

if (!command) {
  yargs.showHelp();
  process.exit(1);
}

if (!isValidCommand(command)) {
  fail(`Command ${command} not found\n${yargs.showHelp()}`);
  process.exit(1);
}

main();

async function main() {
  const config = await loadConfig(args).catch((error) => fail(error));
  const session = await getSession(config).catch((error) => fail(error));
  const manager = new MigrationManager(session);
  await manager.createMigrationsTableIfNotExists();

  switch (command) {
    case Command.INIT:
      manager.init({ failOnExists: true });
      break;
    case Command.APPLY:
      await manager.apply(session);
      break;
    case Command.CREATE:
      manager.create(args.name ?? 'migration');
      break;
    case Command.RESET:
      const isReset = await manager.reset(config.sessionConfig);
      if (isReset) {
        manager.init();
        await manager.createMigrationsTableIfNotExists();
        await manager.apply(session);
      }
      break;
  }
}
