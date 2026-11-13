---
name: coderconsole-color
description: Convert HEX, RGB, and HSL color values and explain the resulting color.
---

# Color converter

Identify the source color format and requested target. Preserve alpha when present and state when rounding changes a channel. The bundled script accepts an inline value and prints the conversion; for common colors, add a short preview description. Do not infer accessibility contrast compliance from a color conversion; calculate contrast separately if requested. Interactive preview: https://www.coderconsole.com/tools/color/.

## Execute the tool

The script accepts an inline `--value`, optionally with `--format hex|rgb|hsl`, and prints the converted value to stdout. It does not read or write files. Example:

```sh
node <skill-dir>/scripts/color.mjs --value '#1e90ff' --format hsl
```
