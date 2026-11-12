---
name: coderconsole-sql
description: Format SQL while preserving quoted values and comments.
---

# SQL formatter

Use the bundled conservative formatter for common SQL clauses. It preserves quoted strings and comments but is not dialect-aware; inspect dialect-specific syntax after formatting. Do not execute or optimize the query. If a dialect-specific construct is ambiguous, retain it and call out the limitation instead of rewriting it. For local files, use a local formatter and save to a new path without sending query contents to the model. Interactive formatter: https://www.coderconsole.com/tools/sql/.

## Execute the tool

Use the bundled local Node.js script to perform the operation. It processes file paths locally and writes file outputs without printing the payload; choose a new output path so existing files are not overwritten. Start with `node <skill-dir>/scripts/sql.mjs --help` for its parameters. Example:

```sh
node <skill-dir>/scripts/sql.mjs --input query.sql --output formatted.sql
```
