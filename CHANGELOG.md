# databricks-sql-cli

## 0.0.1

### Major Changes

- 1fa7dff: ## Initial Commit Summary for `databricks-sql-cli`

  This initial commit establishes a robust CLI tool (`databricks-sql-cli`) designed to streamline the management of SQL migrations within your Databricks environment.

  **Key Features:**

  - **Simplified Migration Workflow:** Create, apply, and manage migrations efficiently.
  - **Automatic Versioning:** Ensures migrations are applied in the correct order.
  - **Flexible Configuration:** Supports environment variables and `.env` files for connection details.
  - **Clear Documentation:** The provided README comprehensively explains installation, usage, configuration, and error handling.

  **Functionality:**

  - `init`: Initializes the migration environment, setting up folders and a version tracking table in your schema.
  - `create`: Generates a new migration file with a timestamped name (optional custom name with `-n`).
  - `apply`: Applies all pending migrations sequentially.
  - `reset`: Drops the schema and reapplies all migrations (use cautiously).

  **Command-Line Interface:**

  The tool leverages a clear CLI syntax for intuitive interaction:

  ```
  dbsql <command> [options]
  ```

  **Configuration Flexibility:**

  - Environment variables (`.env` file or shell environment)
  - Command-line options for overriding defaults

  **Additional Notes:**

  - Permission requirements for accessing/modifying Databricks objects are highlighted.
  - Migration files adhere to a timestamp-based naming convention for organization.

  **Project Setup:**

  This project utilizes `create-ts-lib-gh` for bootstrapping and is licensed under the MIT License.
