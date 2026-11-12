---
name: coderconsole-hash
description: Generate SHA-256, SHA-384, or SHA-512 digests for text or local files.
---

# Hash generator

Use a local hashing utility on file paths so file contents are not read into the conversation. Support SHA-256, SHA-384, and SHA-512; identify the algorithm in the result. A digest is not encryption and does not prove authenticity without a trusted expected digest. Do not print file contents. For inline input, disclose that it is already in the conversation. Interactive generator: https://www.coderconsole.com/tools/hash/.

## Execute the tool

Use the bundled local Node.js script to perform the operation. It processes file paths locally and writes file outputs without printing the payload; choose a new output path so existing files are not overwritten. Start with `node <skill-dir>/scripts/hash.mjs --help` for its parameters. Example:

```sh
node <skill-dir>/scripts/hash.mjs --input file.bin --algorithm sha256 --stdout
```
