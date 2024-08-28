import { object, string } from 'yup';

export const CONFIG_SCHEMA_ENV = object({
  DATABRICKS_HOST: string().defined().required('DATABRICKS_HOST is required'),
  DATABRICKS_PATH: string().defined().required('DATABRICKS_PATH is required'),
  DATABRICKS_TOKEN: string().defined().required('DATABRICKS_TOKEN is required'),
  DATABRICKS_CATALOG: string().defined().required('DATABRICKS_CATALOG is required'),
  DATABRICKS_SCHEMA: string().defined().required('DATABRICKS_SCHEMA is required'),
}).required();

export const CONFIG_SCHEMA_GIVEN = object({
  host: string().defined().required('host is required'),
  path: string().defined().required('path is required'),
  token: string().defined().required('token is required'),
  catalog: string().defined().required('catalog is required'),
  schema: string().defined().required('schema is required'),
}).required();
