---
name: coderconsole-regex
description: Test JavaScript regular expressions and inspect matches and capture groups.
---

# Regex tester

Use JavaScript regular-expression semantics, including flags, and distinguish syntax errors from no matches. Test against the user's explicit sample cases and report match positions and capture groups only as needed. Avoid running complex patterns against large or sensitive inputs without a timeout because backtracking can take excessive time. For local data, use the browser-local tester and do not paste file contents into the conversation. https://www.coderconsole.com/tools/regex/.

## Execute the tool

Use the bundled local Node.js script to perform the operation. It processes file paths locally and writes file outputs without printing the payload; choose a new output path so existing files are not overwritten. Start with `node <skill-dir>/scripts/regex.mjs --help` for its parameters. Example:

```sh
node <skill-dir>/scripts/regex.mjs --input sample.txt --pattern '\bword\b' --flags i --output matches.json
```
