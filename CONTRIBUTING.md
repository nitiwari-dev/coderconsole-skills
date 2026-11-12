# Contributing

Thanks for helping improve CoderConsole skills. The catalog is public so developers can propose new skills and improvements.

## Add or update a skill

1. Put each skill in its own `skills/<skill-id>/` directory.
2. Add a `SKILL.md` with a lowercase, hyphenated `name` and a clear description of when to use the skill.
3. Keep any script or reference file inside that skill's directory. Prefer local processing for developer data; do not add network calls or telemetry to skill scripts without an explicit, documented opt-in design.
4. Add every packaged file to the matching row in `skills/manifest.conf`. The manifest controls both remote downloads and local installs.
5. Update the matching CoderConsole tool page or documentation when the skill changes how developers use that tool.

Keep skills focused and independently installable. Do not modify another skill's behavior unless the change is required for a shared runtime or documented compatibility fix.

## Pull requests

Describe the user task the skill supports, how to invoke it, and any local files it reads or writes. Call out changes to agent support, Node.js requirements, network behavior, and output paths.
