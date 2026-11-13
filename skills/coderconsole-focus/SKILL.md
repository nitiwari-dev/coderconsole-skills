---
name: coderconsole-focus
description: Break development work into focused work sessions with realistic task sequencing.
---

# Focus workspace

Turn a task file (one task per line) into focused work blocks with clear outcomes and breaks. Use requested durations; otherwise the script defaults to 25-minute focus blocks and 5-minute breaks. It writes a plan only; do not claim to start timers, reminders, or browser notifications, which belong to the interactive workspace. Use the user's preferred session length, or ask before assuming one. Interactive workspace: https://www.coderconsole.com/tools/focus/.

## Execute the tool

Run the bundled script from its installed skill directory with Node.js. File-based tools read local input paths. When a command writes a file, it refuses to overwrite an existing destination. Use `--stdout` only when that command supports it and the user explicitly wants terminal output; tools that take inline values print their results directly. Start with `node <skill-dir>/scripts/focus.mjs --help` for its parameters. Example:

```sh
node <skill-dir>/scripts/focus.mjs --input tasks.txt --output focus-plan.md --focus-minutes 25 --break-minutes 5
```
