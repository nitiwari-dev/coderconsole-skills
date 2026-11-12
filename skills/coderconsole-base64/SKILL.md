---
name: coderconsole-base64
description: Encode UTF-8 text to Base64 or decode Base64 text to UTF-8 using a local file, without loading the payload into the model context. Use when asked to Base64 encode or decode text or a text file.
---

# CoderConsole Base64

Use the bundled script for file-based conversions so the payload stays out of the conversation and model context.

## Workflow

1. Determine whether the user wants to encode or decode and identify the input file. If the data was pasted into chat, do not claim it stayed private from the AI provider; it is already part of the conversation.
2. Choose an output path that does not overwrite an existing file. For encoding, use `<input>.base64`; for decoding, use `<input>.decoded.txt`. If that path already exists, choose another name.
3. Run the bundled script with the input and output paths:

   ```sh
   node <skill-directory>/scripts/base64.mjs encode --input <input-path> --output <output-path>
   node <skill-directory>/scripts/base64.mjs decode --input <input-path> --output <output-path>
   ```

   Resolve `<skill-directory>` from this skill's installed location. Pass file paths as quoted shell arguments. Do not read or print the input or output contents unless the user explicitly asks to see the result.
4. Report the operation, byte count, output path, and one of these privacy statements:
   - File input: `Privacy: processed on this device by the bundled script. The script makes no network requests and does not print the payload.`
   - Chat input: `Privacy: the bundled script makes no network requests, but the input was already included in this AI conversation.`
5. If the user explicitly requests inline output, use `--stdout` and return the result. Explain that inline output is included in the AI conversation and can consume tokens.

The bundled script uses Node.js built-ins only. It performs no network access or telemetry. Base64 is encoding, not encryption; it does not protect secrets. For sensitive values, prefer file input and do not display the encoded result in chat.
