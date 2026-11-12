# Release and install URL

Keep this repository public as the source of truth for skill content and contributions. The installer should fetch the manifest and selected files from the same Git ref as the installer itself.

## Publish a version

1. Confirm every file listed in `skills/manifest.conf` exists and that the installer supports the release's skills.
2. Choose a version tag such as `v1.0.0` and create a GitHub release for that tag. Enable release immutability for the repository so published tags and release assets cannot be changed.
3. Keep the published tag available. A stable install command pins both the installer URL and its `--ref` argument to that tag.

Example for a published `v1.0.0` release:

```sh
curl -fsSL https://raw.githubusercontent.com/nitiwari-dev/coderconsole-skills/v1.0.0/scripts/install-coderconsole-skill.sh | sh -s -- --agent codex --skill coderconsole-base64 --scope project --ref v1.0.0
```

## Add a Cloudflare vanity URL

Use a Cloudflare redirect to the tagged raw GitHub installer. If the CoderConsole site is deployed with Cloudflare Pages, add an entry like this to its published `_redirects` file:

```text
/install.sh  https://raw.githubusercontent.com/nitiwari-dev/coderconsole-skills/v1.0.0/scripts/install-coderconsole-skill.sh  302
```

Configure the redirect on the chosen install hostname and replace the example release tag with the current release. Update the destination when publishing a new release. For other Cloudflare hosting setups, create the equivalent 302 redirect rule. Keep the installer downloads pointed at GitHub; the vanity URL is only the stable entry point. A redirect avoids maintaining a Worker that proxies the package.

Cloudflare request analytics can report visits to the install URL. Those requests are not proof that installation completed or that a skill was later used. Keep those metrics labeled as install-link requests.

## Website install snippets

On each tool page with a corresponding skill, show the command for that skill and the chosen coding agent. For a release, use the Cloudflare install URL and set `--ref` to the same tag as the redirect. Offer `--scope project` or `--scope user`; keep installing all skills as an explicit option. The page should link to this repository for the full catalog and contribution guide.
