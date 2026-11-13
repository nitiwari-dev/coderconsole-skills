---
name: coderconsole-markdown
description: Help write Markdown and produce a safe preview without executing embedded content.
---

# Markdown previewer

Help edit Markdown while preserving the requested structure and source text. If asked to preview, use the bundled renderer, which escapes raw HTML and supports common headings, paragraphs, lists, blockquotes, code fences, inline emphasis, and HTTP(S) links. It is a lightweight preview, not a complete CommonMark implementation; do not execute scripts or remote embeds. For local documents, avoid dumping full contents into the conversation when a path-based edit or summary is enough. Interactive browser-local preview: https://www.coderconsole.com/tools/markdown/.

## Execute the tool

Run the bundled script from its installed skill directory with Node.js. File-based tools read local input paths. When a command writes a file, it refuses to overwrite an existing destination. Use `--stdout` only when that command supports it and the user explicitly wants terminal output; tools that take inline values print their results directly. Start with `node <skill-dir>/scripts/markdown.mjs --help` for its parameters. Example:

```sh
node <skill-dir>/scripts/markdown.mjs --input notes.md --output preview.html
```
