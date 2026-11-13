---
name: coderconsole-json
description: Format, minify, or validate JSON while preserving its data.
---

# JSON formatter and validator

Use a JSON parser for validation and formatting; never repair malformed input silently. For local files, keep contents out of the conversation. `format` and `minify` write to a new path (or print only when `--stdout` is requested); `validate` prints a status and creates no output file. Minification changes whitespace only. Report parse errors with location details when available. Interactive formatter: https://www.coderconsole.com/tools/json/.

## Execute the tool

Run the bundled script from its installed skill directory with Node.js. File-based tools read local input paths. When a command writes a file, it refuses to overwrite an existing destination. Use `--stdout` only when that command supports it and the user explicitly wants terminal output; tools that take inline values print their results directly. Start with `node <skill-dir>/scripts/json.mjs --help` for its parameters. Example:

```sh
node <skill-dir>/scripts/json.mjs format --input input.json --output formatted.json
```
