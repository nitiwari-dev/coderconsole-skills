---
name: coderconsole-json-diff
description: Compare JSON documents by object path and identify added, removed, and changed values.
---

# JSON diff checker

Parse both documents as JSON and compare object keys without depending on key order. Compare arrays by index, and explain that a move can appear as multiple path changes. For local files, keep contents out of the conversation and report changed paths; include values only when requested. Reject invalid JSON with the relevant file and parse location. Interactive comparison: https://www.coderconsole.com/tools/json-diff/.

## Execute the tool

Use the bundled local Node.js script to perform the operation. It processes file paths locally and writes file outputs without printing the payload; choose a new output path so existing files are not overwritten. Start with `node <skill-dir>/scripts/json-diff.mjs --help` for its parameters. Example:

```sh
node <skill-dir>/scripts/json-diff.mjs --left old.json --right new.json --output changes.json
```
