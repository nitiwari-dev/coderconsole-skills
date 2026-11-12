---
name: coderconsole-json-to-model
description: Generate typed data models from JSON for TypeScript, Kotlin, Java, Python, Go, or C#.
---

# JSON model generator

Infer models from the JSON shape and the user's target language. Preserve nested objects and array element types, and use a clear root model name. A single sample cannot establish whether fields are optional or whether arrays contain other shapes. If the JSON is a file, run the bundled generator by path; do not load the JSON into the conversation. Mention that sample-only inference may miss fields absent from the sample. Interactive generator: https://www.coderconsole.com/tools/json-to-model/.

## Execute the tool

Use the bundled local Node.js script to perform the operation. It processes file paths locally and writes file outputs without printing the payload; choose a new output path so existing files are not overwritten. Start with `node <skill-dir>/scripts/json-to-model.mjs --help` for its parameters. Example:

```sh
node <skill-dir>/scripts/json-to-model.mjs --input sample.json --language typescript --name ApiResponse --output model.ts
```
