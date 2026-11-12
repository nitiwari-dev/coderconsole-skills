---
name: coderconsole-focus
description: Break development work into focused work sessions with realistic task sequencing.
---

# Focus workspace

Turn the user's task list into a small number of focused work blocks with clear outcomes and breaks. Keep the plan adjustable and do not claim to start timers, reminders, or browser notifications; those belong to the interactive workspace. Use the user's preferred session length, or ask before assuming one. Interactive workspace: https://www.coderconsole.com/tools/focus/.

## Execute the tool

Use the bundled local Node.js script to perform the operation. It processes file paths locally and writes file outputs without printing the payload; choose a new output path so existing files are not overwritten. Start with `node <skill-dir>/scripts/focus.mjs --help` for its parameters. Example:

```sh
node <skill-dir>/scripts/focus.mjs --input tasks.txt --output focus-plan.md --focus-minutes 25 --break-minutes 5
```
