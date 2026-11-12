---
name: coderconsole-color
description: Convert HEX, RGB, and HSL color values and explain the resulting color.
---

# Color converter

Identify the source color format and requested target. Preserve alpha when present and state when rounding changes a channel. For common inline color values, return the converted values with a short preview description. Do not infer accessibility contrast compliance from a color conversion; calculate contrast separately if requested. Interactive preview: https://www.coderconsole.com/tools/color/.

## Execute the tool

Use the bundled local Node.js script to perform the operation. It processes file paths locally and writes file outputs without printing the payload; choose a new output path so existing files are not overwritten. Start with `node <skill-dir>/scripts/color.mjs --help` for its parameters. Example:

```sh
node <skill-dir>/scripts/color.mjs --value '#1e90ff' --format hsl
```
