---
name: coderconsole-json-to-model
description: Generate typed data models from JSON for TypeScript, Kotlin, Java, Python, Go, or C#.
---

# JSON model generator

Infer models from the JSON shape and the user's target language. Preserve nested objects and use a clear root model name. Arrays are inferred from their first item, so heterogeneous arrays need manual review. The generator requires a root object and marks observed properties as required; a single sample cannot establish optional fields or absent properties. For a local JSON file, run the generator by path and keep its contents out of the conversation. Mention these inference limits. Interactive generator: https://www.coderconsole.com/tools/json-to-model/.

## Execute the tool

Run the bundled script from its installed skill directory with Node.js. File-based tools read local input paths. When a command writes a file, it refuses to overwrite an existing destination. Use `--stdout` only when that command supports it and the user explicitly wants terminal output; tools that take inline values print their results directly. Start with `node <skill-dir>/scripts/json-to-model.mjs --help` for its parameters. Example:

```sh
node <skill-dir>/scripts/json-to-model.mjs --input sample.json --language typescript --name ApiResponse --output model.ts
```
