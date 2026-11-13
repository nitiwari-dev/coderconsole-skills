---
name: coderconsole-timestamp
description: Convert Unix timestamps in seconds or milliseconds to readable dates and back.
---

# Unix timestamp converter

The script accepts an inline numeric timestamp or date string and prints UTC plus Unix seconds and milliseconds. It interprets numeric values with absolute magnitude at least 1e12 as milliseconds and smaller values as seconds; ask when the intended unit is ambiguous. Date strings without an explicit timezone can depend on the machine's local timezone. JavaScript Date precision is milliseconds. Interactive converter: https://www.coderconsole.com/tools/timestamp/.

## Execute the tool

The script takes an inline `--value` and prints UTC, Unix seconds, and Unix milliseconds to stdout; it does not read or write files. Example:

```sh
node <skill-dir>/scripts/timestamp.mjs --value 1735689600
```
