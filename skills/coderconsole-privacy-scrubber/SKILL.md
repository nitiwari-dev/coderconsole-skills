---
name: coderconsole-privacy-scrubber
description: Find and redact common credentials and personal data from local text.
---

# Secret and PII scrubber

For file inputs, scan and redact locally without printing the original text. Cover common API-key/token patterns, email addresses, phone-like values, and IPv4 addresses; explain that pattern matching can miss secrets or flag ordinary text. Write the scrubbed result to a new file and preserve a reviewable mapping only if explicitly requested. Do not upload the input. Interactive local scrubber: https://www.coderconsole.com/tools/privacy-scrubber/.

## Execute the tool

Use the bundled local Node.js script to perform the operation. It processes file paths locally and writes file outputs without printing the payload; choose a new output path so existing files are not overwritten. Start with `node <skill-dir>/scripts/privacy-scrubber.mjs --help` for its parameters. Example:

```sh
node <skill-dir>/scripts/privacy-scrubber.mjs --input source.txt --output scrubbed.txt
```
