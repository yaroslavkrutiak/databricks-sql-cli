export const TIMESTAMP_LENGTH = 13;

export const Command = {
  CREATE: 'create',
  APPLY: 'apply',
  INIT: 'init',
  RESET: 'reset',
} as const;

export type Command = (typeof Command)[keyof typeof Command];

export const ConfigOption = {
  host: 'host',
  path: 'path',
  token: 'token',
  catalog: 'catalog',
  schema: 'schema',
} as const;

export type ConfigOption = (typeof ConfigOption)[keyof typeof ConfigOption];
