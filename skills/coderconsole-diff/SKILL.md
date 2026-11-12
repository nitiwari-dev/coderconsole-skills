---
name: coderconsole-diff
description: Compare two text or code files locally and explain line-level changes.
---

# Text diff checker

For file inputs, compare paths locally with `diff -u` and avoid printing file contents into the conversation. Report changed line ranges and a concise summary; save a full diff to a new file when requested. Preserve line endings and do not apply either side of the diff unless asked. For inline text, remember it is already in the conversation. Interactive comparison: https://www.coderconsole.com/tools/diff/.

## Execute the tool

Use the bundled local Node.js script to perform the operation. It processes file paths locally and writes file outputs without printing the payload; choose a new output path so existing files are not overwritten. Start with `node <skill-dir>/scripts/diff.mjs --help` for its parameters. Example:

```sh
node <skill-dir>/scripts/diff.mjs --left before.txt --right after.txt --output changes.txt
```
