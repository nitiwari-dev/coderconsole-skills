---
name: coderconsole-sql
description: Format SQL while preserving quoted values and comments.
---

# SQL formatter

Use the bundled conservative formatter for common SQL clauses. It preserves quoted strings and comments but is not dialect-aware; inspect dialect-specific syntax after formatting. Do not execute or optimize the query. If a dialect-specific construct is ambiguous, retain it and call out the limitation instead of rewriting it. For local files, use a local formatter and save to a new path without sending query contents to the model. Interactive formatter: https://www.coderconsole.com/tools/sql/.

## Execute the tool

Run the bundled script from its installed skill directory with Node.js. File-based tools read local input paths. When a command writes a file, it refuses to overwrite an existing destination. Use `--stdout` only when that command supports it and the user explicitly wants terminal output; tools that take inline values print their results directly. Start with `node <skill-dir>/scripts/sql.mjs --help` for its parameters. Example:

```sh
node <skill-dir>/scripts/sql.mjs --input query.sql --output formatted.sql
```
