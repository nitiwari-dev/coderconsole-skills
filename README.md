# coderconsole-skills

Installable agent skills for CoderConsole developer tools. Each skill is an independent folder under `skills/` with its `SKILL.md` and any local scripts or supporting files. `skills/manifest.conf` is the source of truth for which files are installed. The installer supports Codex, Claude Code, and Antigravity.

## Install

From the root of the project where you want the skills installed, choose one skill or repeat `--skill` for a small set:

```sh
curl -fsSL https://raw.githubusercontent.com/nitiwari-dev/coderconsole-skills/main/scripts/install-coderconsole-skill.sh | sh -s -- --agent codex --skill coderconsole-base64 --scope project
```

```sh
curl -fsSL https://raw.githubusercontent.com/nitiwari-dev/coderconsole-skills/main/scripts/install-coderconsole-skill.sh | sh -s -- --agent codex --skill coderconsole-json --skill coderconsole-color --scope project
```

Choose `codex`, `claude`, or `antigravity` for `--agent`. Use `--agent all` to install into all supported agents. Use `--scope user` to make skills available across projects, or `--scope project` to install them into the current repository. `--skill all` installs the complete collection and is an explicit choice.

The installer accepts `--ref <branch|tag|commit>` to select the source revision for the manifest and skill files. It defaults to `main` for development installs. For repeatable installs, use the same release tag in both the installer URL and `--ref`:

```sh
curl -fsSL https://raw.githubusercontent.com/nitiwari-dev/coderconsole-skills/v1.0.0/scripts/install-coderconsole-skill.sh | sh -s -- --agent codex --skill coderconsole-base64 --scope project --ref v1.0.0
```

See [RELEASING.md](RELEASING.md) for the release and Cloudflare redirect setup.
See [CONTRIBUTING.md](CONTRIBUTING.md) for how to add or update a skill.

Installing requires `sh` and `curl`; running a skill's bundled script requires Node.js. Each skill's `SKILL.md` documents its command and parameters. File operations write to a new output path unless the operation returns a small value such as a color conversion or generated UUID.

## Privacy

Skills that process local files use bundled Node.js scripts and paths so file contents stay out of the model conversation. The skill scripts make no network requests or send telemetry. The installer uses the network only to fetch the manifest and selected skill files. Data pasted into an agent conversation is already visible to that model provider. Base64 is encoding, not encryption.

## Keeping skills in sync with CoderConsole tools

When a CoderConsole tool changes, update its matching skill and the manifest in the same release cycle. Keep the skill instructions and bundled script aligned with the tool's behavior. Add a skill and manifest entry for a new tool; update or remove the matching skill when a tool changes or is retired.
