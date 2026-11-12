---
name: coderconsole-jwt
description: Decode JWT headers and claims locally without treating decoding as signature verification.
---

# JWT viewer

Treat JWTs as credentials. Never repeat a full token or its claims unless the user explicitly requests the output. For file input, decode locally and keep the token out of the model conversation. State clearly that decoding does not verify the signature, issuer, audience, expiry, or trustworthiness. Do not send tokens to online decoders. Interactive local viewer: https://www.coderconsole.com/tools/jwt/.

## Execute the tool

Use the bundled local Node.js script to perform the operation. It processes file paths locally and writes file outputs without printing the payload; choose a new output path so existing files are not overwritten. Start with `node <skill-dir>/scripts/jwt.mjs --help` for its parameters. Example:

```sh
node <skill-dir>/scripts/jwt.mjs --input token.txt --output decoded.json
```
