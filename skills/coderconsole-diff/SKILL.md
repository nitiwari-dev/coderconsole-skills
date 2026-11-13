---
name: coderconsole-diff
description: Compare two text or code files locally and explain line-level changes.
---

# Text diff checker

Compare local text files with the bundled line-based diff. It lists unchanged and changed lines with line numbers, normalizes CRLF/LF separators, and has a 4,000,000 line-pair work limit. Avoid echoing file content into the conversation; save the result to a new path when requested. Do not apply either side of the diff unless asked. For inline text, remember it is already in the conversation. Interactive comparison: https://www.coderconsole.com/tools/diff/.

## Execute the tool

Run the bundled script from its installed skill directory with Node.js. File-based tools read local input paths. When a command writes a file, it refuses to overwrite an existing destination. Use `--stdout` only when that command supports it and the user explicitly wants terminal output; tools that take inline values print their results directly. Start with `node <skill-dir>/scripts/diff.mjs --help` for its parameters. Example:

```sh
node <skill-dir>/scripts/diff.mjs --left before.txt --right after.txt --output changes.txt
```
