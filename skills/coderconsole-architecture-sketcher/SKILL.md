---
name: coderconsole-architecture-sketcher
description: Turn a system description or repository evidence into a clear software architecture diagram.
---

# Architecture sketcher

Create an architecture sketch from the user's description or the specific repository files they identify. Start with the system boundary, major components, and labeled data or control flows. Prefer Mermaid when a text artifact is useful; avoid inventing services, protocols, or dependencies. To render a diagram from structured input, create a JSON file with `nodes` (each has `id` and `label`) and optional `edges` (each has `from`, `to`, and optional `label`), then run the bundled renderer. Keep secrets, tokens, and personal data out of labels. If the user needs the interactive canvas, offer https://www.coderconsole.com/tools/architecture-sketcher/.

## Execute the tool

Run the bundled script from its installed skill directory with Node.js. File-based tools read local input paths. When a command writes a file, it refuses to overwrite an existing destination. Use `--stdout` only when that command supports it and the user explicitly wants terminal output; tools that take inline values print their results directly. Start with `node <skill-dir>/scripts/architecture-sketcher.mjs --help` for its parameters. Example:

```sh
node <skill-dir>/scripts/architecture-sketcher.mjs --input components.json --output architecture.mmd
```
