---
name: coderconsole-uuid
description: Generate UUID v4 or time-ordered UUID v7 values and validate UUID text.
---

# UUID generator

Generate the requested UUID version with a cryptographically secure source, and preserve the requested count and format. UUIDs are identifiers, not authorization secrets. Validate existing values without changing them. If the runtime cannot securely generate v7, do not label a v4 value as v7; use the interactive CoderConsole generator: https://www.coderconsole.com/tools/uuid/.

## Execute the tool

Use the bundled local Node.js script to perform the operation. It processes file paths locally and writes file outputs without printing the payload; choose a new output path so existing files are not overwritten. Start with `node <skill-dir>/scripts/uuid.mjs --help` for its parameters. Example:

```sh
node <skill-dir>/scripts/uuid.mjs --version 7 --count 3
```
