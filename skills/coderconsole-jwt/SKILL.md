---
name: coderconsole-jwt
description: Decode JWT headers and claims locally without treating decoding as signature verification.
---

# JWT viewer

Treat JWTs as credentials. Never repeat a full token or its claims unless the user explicitly requests the output. For file input, decode locally and keep the token out of the model conversation. State clearly that decoding does not verify the signature, issuer, audience, expiry, or trustworthiness. Do not send tokens to online decoders. Interactive local viewer: https://www.coderconsole.com/tools/jwt/.

## Execute the tool

Run the bundled script from its installed skill directory with Node.js. File-based tools read local input paths. When a command writes a file, it refuses to overwrite an existing destination. Use `--stdout` only when that command supports it and the user explicitly wants terminal output; tools that take inline values print their results directly. Start with `node <skill-dir>/scripts/jwt.mjs --help` for its parameters. Example:

```sh
node <skill-dir>/scripts/jwt.mjs --input token.txt --output decoded.json
```
