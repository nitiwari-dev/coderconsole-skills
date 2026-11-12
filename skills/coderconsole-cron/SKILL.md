---
name: coderconsole-cron
description: Validate standard five-field cron expressions and explain their upcoming run times.
---

# Cron expression helper

Work with standard five-field cron syntax (minute, hour, day of month, month, day of week). Explain each field and any ranges, lists, or steps. Ask for the relevant timezone if it is not clear before reporting absolute run times; otherwise label times as local. Do not treat Quartz seconds/year fields or special tokens as standard five-field syntax. Interactive validator: https://www.coderconsole.com/tools/cron/.

## Execute the tool

Use the bundled local Node.js script to perform the operation. It processes file paths locally and writes file outputs without printing the payload; choose a new output path so existing files are not overwritten. Start with `node <skill-dir>/scripts/cron.mjs --help` for its parameters. Example:

```sh
node <skill-dir>/scripts/cron.mjs --expression '*/15 * * * *' --count 5
```
