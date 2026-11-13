---
name: coderconsole-json-diff
description: Compare JSON documents by object path and identify added, removed, and changed values.
---

# JSON diff checker

Parse both documents as JSON and compare object keys without depending on key order. Compare arrays by index, and explain that a move can appear as multiple path changes. For local files, keep contents out of the conversation and report changed paths; include values only when requested. Invalid JSON is rejected, but the script may not identify which input file failed; if unclear, validate each input separately before comparing. Interactive comparison: https://www.coderconsole.com/tools/json-diff/.

## Execute the tool

Run the bundled script from its installed skill directory with Node.js. File-based tools read local input paths. When a command writes a file, it refuses to overwrite an existing destination. Use `--stdout` only when that command supports it and the user explicitly wants terminal output; tools that take inline values print their results directly. Start with `node <skill-dir>/scripts/json-diff.mjs --help` for its parameters. Example:

```sh
node <skill-dir>/scripts/json-diff.mjs --left old.json --right new.json --output changes.json
```
