---
name: coderconsole-url
description: Encode or decode URL components and full URLs correctly.
---

# URL encoder and decoder

First distinguish a full URL from an individual query/path component; use the matching percent-encoding rules and preserve reserved delimiters in full URLs. Decode once only unless asked otherwise, and report malformed percent escapes rather than guessing. For local files, transform locally and write to a new path. Interactive utility: https://www.coderconsole.com/tools/url/.

## Execute the tool

Use the bundled local Node.js script to perform the operation. It processes file paths locally and writes file outputs without printing the payload; choose a new output path so existing files are not overwritten. Start with `node <skill-dir>/scripts/url.mjs --help` for its parameters. Example:

```sh
node <skill-dir>/scripts/url.mjs encode --mode component --input source.txt --output encoded.txt
```
