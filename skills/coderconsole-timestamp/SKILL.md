---
name: coderconsole-timestamp
description: Convert Unix timestamps in seconds or milliseconds to readable dates and back.
---

# Unix timestamp converter

Determine whether the input is seconds, milliseconds, or a date string; do not guess silently when both interpretations are plausible. Specify timezone in date output and preserve sub-second precision when present. For local files, process paths locally and avoid displaying unrelated file contents. Interactive converter: https://www.coderconsole.com/tools/timestamp/.

## Execute the tool

Use the bundled local Node.js script to perform the operation. It processes file paths locally and writes file outputs without printing the payload; choose a new output path so existing files are not overwritten. Start with `node <skill-dir>/scripts/timestamp.mjs --help` for its parameters. Example:

```sh
node <skill-dir>/scripts/timestamp.mjs --value 1735689600
```
