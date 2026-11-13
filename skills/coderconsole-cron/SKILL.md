---
name: coderconsole-cron
description: Validate standard five-field cron expressions and explain their upcoming run times.
---

# Cron expression helper

Work with standard five-field cron syntax (minute, hour, day of month, month, day of week). Explain each field and any ranges, lists, or steps. The local script prints upcoming times in the machine's local timezone; label them accordingly and ask for a timezone when the user needs a different one. It supports `--count` from 1 to 50 (default 5). Do not treat Quartz seconds/year fields or special tokens as standard five-field syntax. Interactive validator: https://www.coderconsole.com/tools/cron/.

## Execute the tool

The script takes an inline `--expression` and prints the next run times to stdout in the machine's local timezone; it does not read or write files. Example:

```sh
node <skill-dir>/scripts/cron.mjs --expression '*/15 * * * *' --count 5
```
