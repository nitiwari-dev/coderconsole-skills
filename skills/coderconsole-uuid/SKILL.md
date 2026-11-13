---
name: coderconsole-uuid
description: Generate UUID v4 or time-ordered UUID v7 values and validate UUID text.
---

# UUID generator

The bundled script generates UUID v4 or v7 values using Node.js cryptographic APIs and prints them to stdout. It does not validate existing UUID text; use the interactive CoderConsole generator for validation. UUIDs are identifiers, not authorization secrets. Preserve the requested version and count: https://www.coderconsole.com/tools/uuid/.

## Execute the tool

The script accepts inline `--version 4|7` and optional `--count` from 1 to 1000 (default 1), then prints generated UUIDs to stdout. It does not read or write files. Example:

```sh
node <skill-dir>/scripts/uuid.mjs --version 7 --count 3
```
