# CoderConsole skills

Add CoderConsole developer tools to your AI coding workflow. Install skills into Codex, Claude Code, or Google Antigravity so your agent can help with tasks such as formatting JSON, comparing files, converting data, and generating hashes.

Choose one skill, several skills, or the full collection. Install them in the current project or for your user account.

## Install

Choose `project` to install into the current repository, or `user` to make the skill available across your projects. Run the `project` command from the repository where you want the skill installed.

### Codex

Project install:

```sh
curl -fsSL https://coderconsole.com/skills/install.sh | sh -s -- --agent codex --scope project --skill all
```

User install:

```sh
curl -fsSL https://coderconsole.com/skills/install.sh | sh -s -- --agent codex --scope user --skill all
```

### Claude Code

Project install:

```sh
curl -fsSL https://coderconsole.com/skills/install.sh | sh -s -- --agent claude --scope project --skill all
```

User install:

```sh
curl -fsSL https://coderconsole.com/skills/install.sh | sh -s -- --agent claude --scope user --skill all
```

### Google Antigravity

Project install:

```sh
curl -fsSL https://coderconsole.com/skills/install.sh | sh -s -- --agent antigravity --scope project --skill all
```

User install:

```sh
curl -fsSL https://coderconsole.com/skills/install.sh | sh -s -- --agent antigravity --scope user --skill all
```

These commands install all available skills. To install only one, replace `all` with its skill name, such as `--skill coderconsole-base64`. To install a few selected skills, repeat the option, for example `--skill coderconsole-base64 --skill coderconsole-json`. See [available tools](#available-tools) for the skill names. After installation, restart or refresh your coding agent to load the skills.

The installer uses the latest contents from the `main` branch by default. To pin an install to a release, add `--ref` with the release tag:

```sh
curl -fsSL https://coderconsole.com/skills/install.sh | sh -s -- --agent codex --scope project --skill all --ref v1.0.0
```

See [CONTRIBUTING.md](CONTRIBUTING.md) for instructions on adding or updating a skill.

## Supported agents and install locations

| Agent (`--agent`) | Scope (`--scope`) | Install location |
| --- | --- | --- |
| `codex` | `project` | `<project>/.agents/skills` |
| `codex` | `user` | `~/.agents/skills` |
| `claude` | `project` | `<project>/.claude/skills` |
| `claude` | `user` | `~/.claude/skills` |
| `antigravity` | `project` | `<project>/.agents/skills` |
| `antigravity` | `user` | `~/.gemini/config/skills` |

## Available tools

| Tool | What it does | Skill name |
| --- | --- | --- |
| Architecture sketcher | Creates a software architecture diagram from a system description or repository evidence. | `coderconsole-architecture-sketcher` |
| Base64 | Encodes or decodes UTF-8 text and files. | `coderconsole-base64` |
| Color converter | Converts between HEX, RGB, and HSL color values. | `coderconsole-color` |
| Cron helper | Validates five-field cron expressions and explains upcoming run times. | `coderconsole-cron` |
| Text diff | Compares two text or code files. | `coderconsole-diff` |
| Focus workspace | Supports focused work sessions with a timer and planning prompts. | `coderconsole-focus` |
| Hash generator | Generates SHA-256, SHA-384, and SHA-512 digests. | `coderconsole-hash` |
| HTML entities | Encodes or decodes HTML entities. | `coderconsole-html-entities` |
| JSON formatter | Formats, minifies, or validates JSON. | `coderconsole-json` |
| JSON diff | Compares JSON documents and reports changes by path. | `coderconsole-json-diff` |
| JSON to model | Generates typed models from JSON for TypeScript, Kotlin, Java, Python, Go, or C#. | `coderconsole-json-to-model` |
| JWT viewer | Decodes JWT headers and claims for inspection. | `coderconsole-jwt` |
| Markdown preview | Formats Markdown and previews its structure safely. | `coderconsole-markdown` |
| Privacy scrubber | Finds and redacts common credentials and personal data. | `coderconsole-privacy-scrubber` |
| Regex tester | Tests JavaScript regular expressions and shows matches and capture groups. | `coderconsole-regex` |
| SQL formatter | Formats SQL while preserving quoted values and comments. | `coderconsole-sql` |
| Timestamp converter | Converts Unix timestamps and readable dates. | `coderconsole-timestamp` |
| URL encoder/decoder | Encodes or decodes URL components and complete URLs. | `coderconsole-url` |
| UUID generator | Generates UUID v4 or v7 values and validates UUID text. | `coderconsole-uuid` |
| YAML ↔ JSON | Converts common YAML and JSON data. | `coderconsole-yaml-json` |

Installing requires `sh` and `curl`; running a skill's bundled script requires Node.js. Each skill's `SKILL.md` documents its command and parameters. File operations write to a new output path unless the operation returns a small value such as a color conversion or generated UUID.

## Privacy

Skills that process local files use bundled Node.js scripts and paths so file contents stay out of the model conversation. The skill scripts make no network requests or send telemetry. The installer uses the network to fetch the manifest and selected skill files. Data pasted into an agent conversation is visible to that model provider. Base64 is encoding, not encryption.

## Keeping skills in sync with CoderConsole tools

When a CoderConsole tool changes, update its matching skill and the manifest in the same release cycle. Keep the skill instructions and bundled script aligned with the tool's behavior. Add a skill and manifest entry for a new tool; update or remove the matching skill when a tool changes or is retired.
