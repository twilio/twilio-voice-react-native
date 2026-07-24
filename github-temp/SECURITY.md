# Security model: release/publish pipeline

This describes the security reasoning behind `prepare-release.yml`, `release.yml`,
`ci.yml`, and the `artifactory-oidc` composite action. It exists so future edits
to these files preserve the properties described here instead of accidentally
undoing them and as a summary to reviewers.

## Core principle

**No job that executes untrusted dependency code (`yarn install`/`npm install`,
including lifecycle scripts) also holds a push-capable git credential or
`id-token: write`.**

`id-token: write` is not audience-scoped: any code running in a job that holds
it can request an OIDC token for *any* configured audience, not just the one
the job intends to use it for. A malicious or compromised transitive
dependency's postinstall script (this repo uses `nodeLinker: node-modules`, so
lifecycle scripts run normally) could otherwise mint a token for a completely
different purpose than the one the job was written for. The fix is
structural, not a permission tweak: split "install dependencies" and "use a
privileged credential" into different jobs, so there is never a moment where
both capabilities exist in the same execution context.

This shows up three times:

- **`prepare-release.yml`**:
  `artifactory-auth` (holds `id-token: write`, never runs `yarn`/`npm`) ->
  hands off a short-lived registry token to `build` (runs `yarn install`, holds only `contents: read`) ->
  hands off its build output to `create-release-branch` (holds `contents: write`, never runs `yarn`/`npm` - just `git` commands).
- **`release.yml`**: `artifactory-auth` (holds `id-token: write`, never runs `yarn`/`npm`) ->
  `test` (runs `yarn install` + checks, `contents: read` only) ->
  `deploy` (holds npm-publish `id-token: write`, gated by the `production` environment).
- **`deploy` runs no install or build step at all** - not just isolated into
  a sibling job, removed outright. There is nothing to build there:
  `prepare-release.yml` already committed the fully-built tree (`lib/`,
  `docs/api/`, constants) into the tagged commit, so `deploy` only needs to
  check out and publish. This closes the gap more completely than a job
  split would: there is no dependency-execution surface in this job, full
  stop, rather than a surface that's merely been relocated.

## How the Artifactory credential is scoped and handed off

- `id-token: write` lives only in each workflow's `artifactory-auth` job.
  Everything else gets the resulting registry token, never the ability to
  mint one.
- The exchanged token is written to `~/.npmrc`, copied to a plain file, and
  passed to the next job via `actions/upload-artifact` /
  `actions/download-artifact` with `retention-days: 1` - not through job
  `outputs`. Job outputs render as plaintext in the workflow run's UI/logs;
  an artifact does not get rendered anywhere, so this keeps the token out of
  anything a casual viewer of the run would see.
- The token itself is scoped to Artifactory only (`virtual-npm-thirdparty`),
  short-lived, and masked (`::add-mask::`) in the composite action before it
  ever appears in a log line.

## Preventing an unreviewed release from reaching npm

- **No workflow ever pushes to `main` or opens a PR automatically.**
  `create-release-branch` only pushes a new `release/<version>` branch.
  A human opens the PR, reviews the diff, and must merge with "Create a
  merge commit" (not squash/rebase) so the release-bump commit survives as
  a distinct, selectable commit. A fully compromised token in that job could
  push arbitrary *branches*, but could not land anything on `main` without a
  human merging a PR.
- **Publishing is triggered by a human manually drafting and publishing a
  GitHub Release**, targeting the release-bump commit directly through
  GitHub's own Release UI (which shows the PR's real commit list).
- **`deploy` sits behind the `production` GitHub environment**, which
  requires manual reviewer approval before the job's steps run at all - a
  human checkpoint independent of every automated check.
- **`move-latest-tag` is its own job**, separate from `deploy`, so the job
  holding npm-publish OIDC never also needs `contents: write` to move a git
  tag, and vice versa.

## Defending job-dependency logic against GitHub Actions' own footguns

Two non-obvious GitHub Actions behaviors matter here, and getting them wrong
silently weakens the pipeline without any visible error:

- **A job-level `if:` that does not literally call one of `success()`,
  `failure()`, `cancelled()`, or `always()` still gets an implicit
  `success()` ANDed in by GitHub automatically** (this requires every job in
  `needs` to have completed with the literal result `success`). Because of
  this, `release.yml`'s `test`/`deploy` conditions explicitly add
  `needs.<job>.result == 'success'` even though it's currently redundant
  with the implicit check - if a future edit adds `always()`/`failure()`/
  `cancelled()` to that same condition for an unrelated reason, the implicit
  gate disappears silently; the explicit clause keeps working regardless.
- **A skipped required job is treated the same as a failed one by default.**
  `ci.yml` relies on this deliberately: `artifactory-auth` and `test` share
  the identical `if: !github.event.pull_request.head.repo.fork` condition,
  so on a fork PR both are skipped together, consistently - fork PRs get no
  CI at all rather than a partially-broken run. (An earlier attempt tried to
  let `test` run without Artifactory access on fork PRs; that required
  fighting this exact default and was abandoned as not worth the added
  fragility - a maintainer reviews and tests fork PRs manually instead.)

## Script-injection avoidance

`workflow_dispatch` inputs (`release_version`, `development_version`) are
passed through `env:` and referenced as `"$VAR"`, never templated directly as
`${{ inputs.x }}` inside a `run:` block. GitHub substitutes `${{ }}`
expressions into the script text *before* the shell parses it, so a value
containing shell metacharacters could otherwise break out of the intended
command. Funneling through `env:` means the shell always treats the value as
inert data.

## Platform-level protections we rely on but do not implement ourselves

These are GitHub-enforced guarantees, not something in this repo's YAML - it's
important to know they exist, because several of the checks in these
workflows would be meaningless without them:

- **A `pull_request` run triggered from a forked repository gets a
  forced-read-only `GITHUB_TOKEN`, no repository/organization secrets, and
  cannot obtain a usable OIDC token** - regardless of what the workflow file
  requests in `permissions:`. This is enforced by GitHub itself and cannot be
  changed by editing the workflow. It's the actual reason a malicious PR that
  edits `ci.yml` to delete the `!head.repo.fork` check still can't
  exfiltrate anything: the job would attempt to run, but the Artifactory
  OIDC exchange step would fail regardless.
- **`pull_request_target` always evaluates using the workflow file version
  already on the base branch, never a PR's own proposed edits.** None of
  these workflows use `pull_request_target` (the trigger that combines
  fork-controlled code with base-repo secrets - the genuinely dangerous
  combination). Because of this platform behavior, a PR that adds
  `pull_request_target` (or `push`, `workflow_dispatch`, `schedule`) to its
  own copy of a workflow file cannot make that trigger take effect without
  the change first being merged - at which point the problem is "we merged
  malicious code," a code-review failure, not a workflow-trigger trick.
- **`workflow_dispatch` requires write access to the repository being
  dispatched against, and can only target refs that exist in that same
  repository** - a fork's branch is not selectable from the upstream repo's
  dispatch UI/API. `prepare-release.yml` is therefore only reachable by an
  already-trusted maintainer.

## What would NOT make this secure (rejected or hypothetical approaches)

- **Treating `!github.event.pull_request.head.repo.fork` or
  `github.repository_owner == 'twilio'` as the actual security boundary.**
  They are convenience conditions that turn a guaranteed failure into a
  clean, immediate skip. The real boundary is the platform behavior
  described above (for fork PRs) and, for `release.yml`, the external
  scoping of the npm trusted publisher and Artifactory's OIDC trust policy
  to this exact repository - configured outside this YAML, not inside it.
  If those external configurations were wrong or missing, no amount of
  `if:` logic in these files would compensate.
- **Using `pull_request_target` to give fork PRs richer testing (e.g. with
  Artifactory access).** This would check out and potentially execute the
  PR's own attacker-controlled code while retaining the base repository's
  real secrets and tokens - the combination this design specifically avoids
  everywhere.
- **Passing the Artifactory token through job `outputs`/`$GITHUB_OUTPUT`**
  instead of a short-lived artifact. Outputs are rendered in the run's
  logs/UI; nothing about them requires or guarantees masking for arbitrary
  values the way `::add-mask::` does inline.
- **Granting `id-token: write` to any job that also installs dependencies.**
  Even scoped to "just Artifactory," the permission itself isn't
  audience-scoped - a compromised postinstall script in that job could
  request a token for a different audience entirely.
- **Assuming a bare custom `if:` preserves "all needed jobs must have
  succeeded."** It does not, unless the condition includes a status-check
  function - see the job-dependency section above.
- **Treating a floating action tag (e.g. `@v4`) as equivalent to a pinned
  commit SHA.** A tag can be moved by the action's maintainer (or a
  compromised maintainer account) to point at different code without any
  change visible in this repository's history.

## Known open items (not yet closed)

- Every `uses: actions/...` line is currently a `<SHA-CHECKSUM> # TODO: pin`
  placeholder. These must be filled in with real, verified commit SHAs
  before this pipeline is production-ready - until then, the "pinned action"
  protection described above does not actually apply yet.
- The `production` GitHub environment (required reviewers) must exist and be
  configured before `deploy`'s approval gate means anything; without it, the
  job runs unattended.
- The npm trusted publisher must be configured on npmjs.com, scoped
  specifically to this repository, `release.yml`, and the `production`
  environment - without this, OIDC publish fails outright, but a looser
  scope would also weaken the guarantee this document describes.
- Branch protection on `main` and a merge-strategy setting that allows
  "Create a merge commit" for release PRs must both be confirmed.
