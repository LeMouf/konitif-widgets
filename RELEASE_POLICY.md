# Widgets release admission

Candidate: 0.285.0. Preparing this repository does not authorize publication.

The validation workflow has read-only permissions. It uses the runner's
preinstalled Node 24.20.0 and fails if absent, without downloading a runtime.
Its npm install is limited by the lockfile to TypeScript 5.9.3 and disables
lifecycle scripts. Local verification uses already-installed tooling only.

Publication is gated by the exact repository `LeMouf/konitif-widgets`, a
`v<package version>` push whose commit belongs to main, the variable
`WIDGETS_NPM_PUBLISH_ENABLED == true`, and the `npm-release` environment.
Keep the variable unset until separate explicit approval. The package, license,
repository, registry and lockfile identities are checked before retention of
the archive. Only the freshly consumer-tested archive is eligible for publish;
retention verifies its SHA-512 and size and refuses to overwrite an existing one.

Before enabling: configure/review branch and immutable tag protection, required
CI checks, environment reviewers and tag restrictions, and npm scope access /
Trusted Publisher. These external protections are not created by these files.
First-publication credentials and procedure require a separate decision.

`private: false` is not a manual-publish safety lock. A maintainer must not run
`npm publish` without approval. Do not reuse 0.285.0 after it is published.
No credentials, partner assets or runtime product implementations belong here.
