---
name: coderconsole-yaml-json
description: Convert common YAML and JSON data using safe local parsing.
---

# YAML and JSON converter

Identify input and output formats and use a safe YAML loader (never an unsafe object-construction loader). The bundled safe parser supports common indented mappings and sequences, scalar values, comments, and JSON-compatible flow collections. It rejects tags, anchors, aliases, block scalars, and unsupported structures instead of guessing. For file input, keep data local and write output to a new path. Use the browser-local converter for YAML outside that supported subset: https://www.coderconsole.com/tools/yaml-json/.

## Execute the tool

Run the bundled script from its installed skill directory with Node.js. File-based tools read local input paths. When a command writes a file, it refuses to overwrite an existing destination. Use `--stdout` only when that command supports it and the user explicitly wants terminal output; tools that take inline values print their results directly. Start with `node <skill-dir>/scripts/yaml-json.mjs --help` for its parameters. Example:

```sh
node <skill-dir>/scripts/yaml-json.mjs yaml-to-json --input input.yaml --output output.json
```
