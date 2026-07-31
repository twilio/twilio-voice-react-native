# Security model: release/publish pipeline

This describes the security reasoning behind `prepare-release.yml`,
`release.yml`, `ci.yml`, and the `artifactory-oidc` composite action. It exists
so future edits to these files preserve the properties described here instead of
accidentally undoing them, and as a summary for reviewers.

## Core principle

**No credential ever leaves the job that minted it, and no job that executes
untrusted dependency code holds a push-capable git credential.**

This repository is **public**. That single fact drives the design more than
anything else, because it means workflow run metadata is world-readable:
anyone can download a public repo's run artifacts, with no authentication and
no org membership, for as long as those artifacts are retained. A live
credential placed in an artifact is therefore a published credential, not a
private hand-off between jobs - a known real-world leak class for public
repositories, not a theoretical one.

**So the credential is never handed off between jobs.** Each job that needs
registry access performs its own OIDC exchange and writes its own `~/.npmrc`.
The token exists only inside the job that will use it, never in run metadata.

A masked job output and a short artifact `retention-days` both look like
adequate substitutes but are not - see "What would NOT make this secure" below.

### The tradeoff this accepts

`id-token: write` is not audience-scoped: any code running in a job that holds
it can request an OIDC token for *any* configured audience, not just
Artifactory's. Because the exchange now happens in the same job as
`yarn install`, a malicious or compromised transitive dependency's postinstall
script (this repo uses `nodeLinker: node-modules`, so lifecycle scripts run
normally) could in principle mint an OIDC token for npm's audience.

This is an accepted, deliberate tradeoff, for two reasons:

1. **npm's trusted publisher validates the token's claims, not just its
   audience** - specifically the repository, the workflow, and the
   environment. That external scoping is the real control now, and it must be
   configured correctly regardless of how these workflows are structured.
2. **It trades a definite, unconditional exposure for a conditional weakening
   of a secondary layer.** Publishing a live credential to a world-readable
   artifact required no attacker sophistication at all. The remaining risk
   requires both a compromised dependency *and* a misconfigured npm trusted
   publisher.

**The exposure is bounded by which workflow file the dependency code runs in.**
`deploy` does hold `id-token: write` - that is how `npm publish` authenticates -
so tokens are certainly minted in `release.yml`. The point is that no
*third-party* code is ever in a position to mint one there: no job in that file
runs `yarn install`, and the only things executing are npm itself plus two
first-party scripts that have no dependencies of their own.

The jobs that do run `yarn install` live in `ci.yml` and `prepare-release.yml`,
and a token minted in either carries a `workflow_ref` pointing at that file -
not at `release.yml` - so it fails the publisher's workflow check before the
environment claim is even considered.

That is why keeping `release.yml` free of dependency installs matters, and why
adding a job there that runs `yarn install` would be a meaningful regression:
such a job's tokens would carry a `workflow_ref` the publisher accepts, leaving
the `production` environment claim as the only thing distinguishing them from a
real publish.

### What is still structurally isolated

- **`deploy` runs no install or build step at all** - not isolated into a
  sibling job, removed outright. There is nothing to build there:
  `prepare-release.yml` already committed the fully-built tree (`lib/`,
  `docs/api/`, constants) into the tagged commit, so `deploy` only needs to
  check out and publish. The job holding npm-publish OIDC therefore executes
  no dependency code whatsoever. This is the isolation that actually matters
  and it remains fully intact.
- **`create-release-branch` holds `contents: write` but installs no
  dependencies.** It runs mostly `git` commands. It does invoke `npm version`
  and `node ./scripts/substitute-constants-version.js` for the
  development-version continuation commit, but there is no `yarn install` in
  this job and therefore no `node_modules` - so no third-party code executes.
  `npm` and `node` here are the runtime's own binaries, and
  `substitute-constants-version.js` is first-party and uses only `fs`
  built-ins. The job that can push has no dependency-execution surface.
- **The two jobs that install dependencies hold only `contents: read`**
  alongside `id-token: write` - `build` in `prepare-release.yml` and `test` in
  `ci.yml`. They can install and build, but cannot push anything. `release.yml`
  has no such job.
- **`deploy` publishes with `--ignore-scripts`**, which is load-bearing rather
  than hygiene: `package.json` defines a `prepare` script
  (`build:constants && bob build`), and `deploy` deliberately has no
  `node_modules` for it to run against. Removing `--ignore-scripts` would both
  break the publish and reintroduce script execution into the job holding
  npm-publish OIDC.

### What this does NOT protect against

**A compromised dependency can still poison the build output.** Nothing in the
current structure prevents this, and no arrangement of job permissions would.
A malicious postinstall script running during `build`'s `yarn install` can
modify the generated tree (`lib/`, `docs/api/`, `src/constants.ts`) before it
is uploaded as the `release-tree` artifact. `create-release-branch` then
force-adds those files (`git add -f lib`) and commits them with `--no-verify`,
and `deploy` later publishes that tree verbatim. `--ignore-scripts` does not
help, because the payload would be in the shipped library code rather than in a
lifecycle script.

The only barrier is human review of the release PR - and that diff is
thousands of lines of legitimately-regenerated build output, so injected code
is unlikely to be noticed. **This is currently the most significant
unmitigated risk in the pipeline.** The intended mitigation is an independent
dependency-vulnerability gate; see "Known open items" below.

## How the Artifactory credential is scoped

- The token is minted, written to `~/.npmrc`, and used entirely within a
  single job. It is never uploaded, never passed as a job output, and never
  written anywhere that outlives the job.
- It is scoped to Artifactory only (`virtual-npm-thirdparty`), short-lived,
  and masked (`::add-mask::`) in the composite action before it can appear in
  a log line.
- **The `artifactory-oidc` composite action and the Artifactory-side OIDC
  provider configuration are owned by the internal platform team and treated
  as trusted.** What a minted token is actually permitted to do in Artifactory
  is decided by that provider mapping, not by anything in this repository -
  including whether it is read-only against the mirror or carries deploy
  rights. Since jobs that install dependencies now hold `id-token: write`,
  that mapping is the bound on what a compromised dependency could reach in
  Artifactory. It is delegated deliberately, not overlooked.

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

## Defending job-dependency logic against a GitHub Actions footgun

**A job-level `if:` that does not literally call one of `success()`,
`failure()`, `cancelled()`, or `always()` still gets an implicit `success()`
ANDed in by GitHub automatically** (this requires every job in `needs` to have
completed with the literal result `success`). Because of this, `release.yml`'s
`deploy` and `move-latest-tag` conditions explicitly add
`needs.<job>.result == 'success'` even though it's currently redundant with
the implicit check - if a future edit adds `always()`/`failure()`/
`cancelled()` to that same condition for an unrelated reason, the implicit
gate disappears silently; the explicit clause keeps working regardless.

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
- **Writing a live credential into workflow run metadata on a public repo -
  whether as an uploaded artifact or a job output.** Both are world-readable
  on a public repository. A short `retention-days` does not mitigate this,
  because the exposure window that matters is the credential's own lifetime.
- **Assuming `::add-mask::` protects a value once it leaves the job.** Masking
  suppresses a value in *log output* for the job that registered it. It says
  nothing about whether that value is retrievable from an artifact, and it
  does not travel with the value into another job's context.
- **Isolating `id-token: write` into its own job and handing the resulting
  token to the job that installs dependencies.** This is a tempting way to
  keep dependency code away from the minting permission, and it is how this
  pipeline was originally built. It does not work on a public repo: the
  hand-off has to go through run metadata, which is world-readable. Any
  future attempt to restore that isolation has to solve the hand-off problem
  first - see the tradeoff section above for why minting in-place was chosen
  instead.
- **Assuming a bare custom `if:` preserves "all needed jobs must have
  succeeded."** It does not, unless the condition includes a status-check
  function - see the job-dependency section above.
- **Treating a floating action tag (e.g. `@v4`) as equivalent to a pinned
  commit SHA.** A tag can be moved by the action's maintainer (or a
  compromised maintainer account) to point at different code without any
  change visible in this repository's history.

## Known open items (not yet closed)

- The `production` GitHub environment (required reviewers) must exist and be
  configured before `deploy`'s approval gate means anything; without it, the
  job runs unattended. Note its "deployment branches and tags" rule is
  evaluated against `github.ref`, which for a `release`-triggered run is the
  *tag*, not the branch - it needs a tag pattern matching real version tags
  (final and RC alike), not just a branch pattern.
- The npm trusted publisher must be configured on npmjs.com, scoped
  specifically to this repository, `release.yml`, and the `production`
  environment. The workflow scoping is what currently carries the weight, since
  no job in `release.yml` runs third-party code; the environment claim is
  defense-in-depth on top of that. Set it anyway - leaving it blank still
  publishes correctly and fails no test, so a later change that reintroduces a
  dependency install into `release.yml` would silently have no backstop.
- **An independent dependency-vulnerability gate does not exist yet**
  (`yarn npm audit`, Dependabot alerts, or an SCA tool). This is the intended
  mitigation for the build-output poisoning path described above, and it is
  the one significant control this pipeline is still missing. It should not
  rely solely on Artifactory: confirm whether `virtual-npm-thirdparty` is a
  plain caching mirror (audit trail only, no vetting of package contents) or
  has JFrog Xray with a *blocking* policy attached. Caching does not imply
  scanning.
- **`latest` can regress if releases are approved out of order.** Both npm's
  `latest` dist-tag and the `latest` git tag are set by whichever `deploy` run
  finishes last, not by which version is highest. If 1.7.0's `deploy` is left
  waiting on its `production` approval while 1.7.1 is approved and completes,
  approving the stale 1.7.0 run afterwards moves `latest` backwards - silently
  changing what a plain `npm install` resolves to, with no error in either run.
  Nothing in the pipeline compares against the currently-published version.
- Branch protection on `main` and a merge-strategy setting that allows
  "Create a merge commit" for release PRs must both be confirmed.
