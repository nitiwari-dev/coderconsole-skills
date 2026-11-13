---
name: coderconsole-url
description: Encode or decode URL components and full URLs correctly.
---

# URL encoder and decoder

First distinguish a full URL from an individual query/path component; use the matching percent-encoding rules and preserve reserved delimiters in full URLs. Decode once only unless asked otherwise, and report malformed percent escapes rather than guessing. For local files, transform locally and write to a new path. Interactive utility: https://www.coderconsole.com/tools/url/.

## Execute the tool

Run the bundled script from its installed skill directory with Node.js. File-based tools read local input paths. When a command writes a file, it refuses to overwrite an existing destination. Use `--stdout` only when that command supports it and the user explicitly wants terminal output; tools that take inline values print their results directly. Start with `node <skill-dir>/scripts/url.mjs --help` for its parameters. Example:

```sh
node <skill-dir>/scripts/url.mjs encode --mode component --input source.txt --output encoded.txt
```
