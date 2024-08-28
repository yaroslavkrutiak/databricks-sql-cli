import yargs, { normalize } from 'yargs';

import { Command } from '../constants';

type Agruments = {
  _: string[];
  host?: string;
  path?: string;
  token?: string;
  catalog?: string;
  schema?: string;
  env?: string;
  noEnvFile?: boolean;

  name?: string;
};

export const getArguments = () =>
  yargs(process.argv.slice(2))
    .scriptName('dbsql')
    .command(Command.CREATE, 'Create a migration file', (yargs) => {
      return yargs.option('name', {
        alias: 'n',
        type: 'string',
        description: 'The name of the migration to be created',
        demandOption: false,
        default: 'migration',
      });
    })
    .command(Command.APPLY, 'Apply unapplied migrations')
    .command(Command.INIT, 'Initialize migrations folder and table')
    .command(Command.RESET, 'Truncate schema and apply all migrations from scratch')
    .option('host', {
      alias: 'h',
      type: 'string',
      description: 'The host of the Databricks workspace',
      demandOption: false,
    })
    .option('path', {
      alias: 'p',
      type: 'string',
      description: 'The path of the Databricks workspace',
      demandOption: false,
    })
    .option('token', {
      alias: 't',
      type: 'string',
      description: 'The access token for the Databricks workspace',
      demandOption: false,
    })
    .option('catalog', {
      alias: 'c',
      type: 'string',
      description: 'The catalog for the Databricks workspace',
      demandOption: false,
    })
    .option('schema', {
      alias: 's',
      type: 'string',
      description: 'The schema for the Databricks workspace',
      demandOption: false,
    })
    .option('env', {
      type: 'string',
      description: 'The path to the env file',
      demandOption: false,
    })
    .option('noEnvFile', {
      type: 'boolean',
      description: 'Do not load the env file and take all the values from the environment',
      demandOption: false,
    })
    .help().argv as Agruments;

export const isValidCommand = (input: string): input is Command =>
  Object.values(Command).includes(input as Command);
