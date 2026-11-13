---
name: coderconsole-regex
description: Test JavaScript regular expressions and inspect matches and capture groups.
---

# Regex tester

Use JavaScript regular-expression semantics and distinguish syntax errors from no matches. The local script reads a file up to 1 MB, defaults to a 500 ms timeout (maximum 5 seconds), and returns match positions, lengths, and capture metadata without matched text; cap results at 10,000. Test against the user's explicit sample cases and report details only as needed. Avoid running complex patterns against sensitive inputs. Interactive tester: https://www.coderconsole.com/tools/regex/.

## Execute the tool

Run the bundled script from its installed skill directory with Node.js. File-based tools read local input paths. When a command writes a file, it refuses to overwrite an existing destination. Use `--stdout` only when that command supports it and the user explicitly wants terminal output; tools that take inline values print their results directly. Start with `node <skill-dir>/scripts/regex.mjs --help` for its parameters. Example:

```sh
node <skill-dir>/scripts/regex.mjs --input sample.txt --pattern '\bword\b' --flags i --output matches.json
```
