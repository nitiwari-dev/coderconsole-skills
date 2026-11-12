---
name: coderconsole-markdown
description: Help write Markdown and produce a safe preview without executing embedded content.
---

# Markdown previewer

Help edit Markdown while preserving the requested structure and source text. If asked to preview, use the bundled renderer, which escapes raw HTML and supports common headings, paragraphs, lists, blockquotes, code fences, inline emphasis, and HTTP(S) links. It is a lightweight preview, not a complete CommonMark implementation; do not execute scripts or remote embeds. For local documents, avoid dumping full contents into the conversation when a path-based edit or summary is enough. Interactive browser-local preview: https://www.coderconsole.com/tools/markdown/.

## Execute the tool

Use the bundled local Node.js script to perform the operation. It processes file paths locally and writes file outputs without printing the payload; choose a new output path so existing files are not overwritten. Start with `node <skill-dir>/scripts/markdown.mjs --help` for its parameters. Example:

```sh
node <skill-dir>/scripts/markdown.mjs --input notes.md --output preview.html
```
