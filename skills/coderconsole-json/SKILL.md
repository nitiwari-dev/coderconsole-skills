---
name: coderconsole-json
description: Format, minify, or validate JSON while preserving its data.
---

# JSON formatter and validator

Use a JSON parser for validation and formatting; never repair malformed input silently. For local files, run a local formatter and write to a new path rather than printing the document. Minification changes whitespace only. Report parse errors with line and column where available. Interactive formatter: https://www.coderconsole.com/tools/json/.

## Execute the tool

Use the bundled local Node.js script to perform the operation. It processes file paths locally and writes file outputs without printing the payload; choose a new output path so existing files are not overwritten. Start with `node <skill-dir>/scripts/json.mjs --help` for its parameters. Example:

```sh
node <skill-dir>/scripts/json.mjs format --input input.json --output formatted.json
```
