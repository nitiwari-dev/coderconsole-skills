---
name: coderconsole-html-entities
description: Encode or decode HTML entities without rendering the supplied markup.
---

# HTML entity encoder and decoder

Determine whether the user wants HTML entity encoding or decoding. For file inputs, use the bundled script and write to a new output file; do not render, execute, or echo the markup. Encoding escapes ampersand, angle brackets, quotes, and apostrophes. Decoding supports those named entities, `nbsp`, and numeric entities; other named entities remain unchanged. Preserve UTF-8 and distinguish text encoding from sanitization: entity encoding alone is not a complete security boundary. Interactive utility: https://www.coderconsole.com/tools/html-entities/.

## Execute the tool

Use the bundled local Node.js script to perform the operation. It processes file paths locally and writes file outputs without printing the payload; choose a new output path so existing files are not overwritten. Start with `node <skill-dir>/scripts/html-entities.mjs --help` for its parameters. Example:

```sh
node <skill-dir>/scripts/html-entities.mjs encode --input markup.txt --output encoded.txt
```
