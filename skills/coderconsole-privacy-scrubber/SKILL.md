---
name: coderconsole-privacy-scrubber
description: Find and redact common credentials and personal data from local text.
---

# Secret and PII scrubber

For file inputs, scan and redact locally without printing the original text. The script checks common credential patterns, email addresses, phone-like values, and IPv4 addresses; it can miss secrets or flag ordinary text, so review its output. It writes a scrubbed result to a new file and reports category counts, but does not create a replacement mapping. Do not upload the input. Interactive local scrubber: https://www.coderconsole.com/tools/privacy-scrubber/.

## Execute the tool

Run the bundled script from its installed skill directory with Node.js. File-based tools read local input paths. When a command writes a file, it refuses to overwrite an existing destination. Use `--stdout` only when that command supports it and the user explicitly wants terminal output; tools that take inline values print their results directly. Start with `node <skill-dir>/scripts/privacy-scrubber.mjs --help` for its parameters. Example:

```sh
node <skill-dir>/scripts/privacy-scrubber.mjs --input source.txt --output scrubbed.txt
```
