# Release pipeline: the dispatch flow

This folder holds the release/publish pipeline we are shipping. It replaces the
approach in `github-temp/`, which is kept only for reference.

Two designs were built. This document names them, records why we moved from one
to the other, and captures the decisions the dispatch flow rests on.

## The two flows

- **Publish flow** (`github-temp/`, frozen): `release.yml` was triggered by a
  GitHub Release being published (`release: types: [published]`). The npm
  dist-tag and whether to move the `latest` git tag were *inferred* - from the
  version string and from the release's "Set as the latest release" checkbox.
- **Dispatch flow** (this folder): `release.yml` is triggered by
  `workflow_dispatch`, run from a `release/<version>` branch. The dist-tag and
  the tag-move are *declared* by the operator as workflow inputs. Nothing is
  inferred.

## Why we moved off the publish flow

The publish flow needed to know whether a release was "the latest" so it could
choose between the `latest` dist-tag and a backport tag, and decide whether to
move the `latest` git tag. The intent lived in the GitHub Release UI's "Set as
the latest release" checkbox.

**That checkbox is not readable from the workflow.** `make_latest` is a
write-only parameter of the create/update-release REST API; it is not a field
on the release resource, so it is absent from the `release` webhook payload
(confirmed in a test repo - `github.event.release.make_latest` is empty). The
payload carries `prerelease` and `draft`, which distinguish a prerelease from a
final release, but nothing that distinguishes a latest release from a backport.

The fallback was to query `GET /releases/latest` and compare, but its
correctness hinges on that endpoint honoring the checkbox rather than pure
recency - which GitHub's own docs describe ambiguously. Rather than ship a
release pipeline resting on an unverified assumption about a third-party API, we
stopped inferring intent and started asking for it.

## How the dispatch flow works

1. **`prepare-release.yml`** (`workflow_dispatch`, input `release_version`) -
   bumps the version, stamps constants, builds, and pushes a
   `release/<version>` branch with the built tree committed. It exists as a
   stable, already-built commit to publish from.
2. **A human runs `release.yml`** from that branch (picks it in the "Run
   workflow" dropdown), choosing:
   - `npm_dist_tag`: one of `latest`, `beta`, `preview`, `backport`.
   - `move_latest_tag`: whether to also move the `latest` git tag.
   - `development_version` (optional): the next dev version to commit onto the
     release branch.
   Four jobs run as a chain, all keyed off the same dispatch commit
   (`GITHUB_SHA`): `deploy` -> `create-github-release` -> `move-latest-tag` ->
   `continue-development`.
   - `deploy` publishes the branch's tree to npm, behind the `production`
     approval.
   - `create-github-release` creates the tag and GitHub Release at that commit,
     marked latest to match `move_latest_tag`.
   - `move-latest-tag` moves the `latest` git tag, only if the box was checked.
   - `continue-development` commits the next `-dev` version onto the release
     branch (and removes the built artifacts), only if a version was given -
     whether or not `latest` moved. It runs after the publish, so it never
     changes what shipped.
3. **A human merges `release/<version>` into `main`** at some point, to advance
   `main`'s version. The workflow cannot do this itself (see below); it only
   stages the commit. Because the artifacts were added in the release commit and
   removed in the continue-development commit, the merge's net diff against
   `main` is just the version bump.

## Decisions

- **Dispatch, not publish trigger.** Intent (dist-tag, tag-move) is declared as
  inputs instead of inferred. This is the whole reason for the rewrite.
- **A `concurrency` group serializes releases.** `group: release` with
  `cancel-in-progress: false` lets only one release run at a time; a second
  dispatch queues rather than cancelling the first or racing it on the npm
  `latest` dist-tag or the `latest` git tag. It was left off during development
  because it caused inconsistent starts under the publish-hook trigger; under
  `workflow_dispatch` it behaves correctly, confirmed in the test repo.
- **`npm_dist_tag` is a `choice` input, including `backport`.** A dropdown
  prevents typos and blocks a value like `1.6.x`, which npm rejects at publish
  because it parses as a semver range. `backport` is the shared tag for an
  older-line release that should not take `latest`.
- **Full trust, everywhere. No version/dist-tag validation at all.** Neither
  workflow classifies or checks the version; the `classify-version-tag.js`
  script is no longer used by either. A wrong input publishes wrongly with no
  backstop; the `production` approver is the only check. Chosen for simplicity
  and speed to ship.
- **`move_latest_tag` is a separate boolean, not derived from the dist-tag.**
  Full operator control. It does allow an incoherent combination (e.g. dist-tag
  `beta` with the tag-move on); that is accepted. It also drives whether the
  GitHub Release is marked latest, keeping the Release badge and the git tag
  consistent.
- **The GitHub Release is created by the workflow, at the published commit.**
  `create-github-release` targets `GITHUB_SHA` directly (not the branch name),
  so `continue-development` moving the branch head afterward cannot repoint it.
  The body is a placeholder TODO that the operator fills in by editing the
  Release afterward - not `--generate-notes`.
- **continue-development commits onto the release branch, after publishing.**
  The next `-dev` bump lands as a second commit on `release/<version>` so the
  branch can be merged to `main` as one unit. It runs after `deploy`, and every
  write job targets the frozen `GITHUB_SHA`, so moving the branch head does not
  affect the publish, the tag, or the Release. Its push uses an explicit refspec
  (`HEAD:${GITHUB_REF}`) rather than `HEAD`, so it lands on the release branch
  regardless of whether the checkout is on that branch or detached.
- **The jobs are chained, and `continue-development` guards the skipped-middle
  footgun.** The chain gives a deterministic order. `move-latest-tag` is skipped
  when `move_latest_tag` is false, and a skipped `needs` job would fail the
  implicit `success()` gate - so `continue-development` uses `!cancelled()` plus
  explicit result checks (deploy and create-github-release succeeded,
  move-latest-tag succeeded *or* skipped) and lists all three upstream jobs in
  `needs` so their results are readable. Without this it would silently not run
  on any release where `latest` was not moved.
- **`release.yml` is run *from* the release branch, not handed a branch as an
  input.** For `workflow_dispatch`, GitHub runs the workflow file from, and sets
  `GITHUB_SHA` to, the ref you select - so the branch head is what gets checked
  out and published, and the tag-move, the Release, and npm provenance all point
  at the right commit. Passing a ref as an input and checking it out separately
  would instead leave `GITHUB_SHA` (and therefore provenance) pointing at the
  default branch.

## Consequences we are accepting

- **`main` advances only after a human merges the release branch.**
  `continue-development` commits the next `-dev` version onto
  `release/<version>`, but the workflow cannot land it on `main`: branch
  protection blocks a direct push, and the org blocks Actions from opening a PR.
  A human opens and merges that PR. Until they do, `main`'s `package.json` stays
  at its old `-dev` version - harmless, since every release names its version
  explicitly in `prepare-release`, but `main` lags what is published.
- **The publish itself is not PR-reviewed.** The publish flow expected a human to
  review the release branch's diff in a PR before anything shipped. Here the
  publish is gated only by the `production` approval; the merge-to-`main` PR
  happens *after* the publish and reviews just the version bump (the artifacts
  net out - see "How it works"). The old reviewed diff was mostly generated build
  output anyway, so little is lost in practice.
- **The GitHub Release is post-hoc.** The workflow creates it after npm already
  published, so it cannot gate anything, and its body is a placeholder the
  operator fills in afterward.
- **Dispatching from the wrong branch publishes the wrong thing.** With full
  trust and no ref guard, dispatching `release.yml` from `main` would publish
  `main`'s `-dev` version - which has no built artifacts committed. `deploy`
  carries a comment marking where a `refs/heads/release/*` guard would go.
- **Release branches accumulate** and are never cleaned up automatically.

## Security posture vs the publish flow

- **Same trust boundary on the trigger.** `workflow_dispatch` requires write
  access to the repository and cannot be invoked from a fork, exactly like
  publishing a Release did.
- **The `production` approval is enforceable only because the npm trusted
  publisher requires the `production` environment claim.** `release.yml` runs
  from the dispatched branch, and `release/*` branches are not protected, so a
  write-access actor could push a branch with `environment: production` stripped
  from `deploy` to skip the approval. The OIDC token carries the `environment`
  claim only when the job declares the environment - and GitHub runs the
  approval before the job starts - so a publisher that *requires*
  `environment: production` blocks the stripped-environment token: keep the
  environment and the approval fires, remove it and npm rejects the publish. The
  platform team mandates the environment claim, so this holds; it must stay
  required. Without it, run-from-branch would make the approval bypassable.
- **The isolation split holds.** Only `prepare-release.yml`'s `build` job runs
  `yarn install`, and it has `contents: read` (no push). Every job that can push
  - `create-release-branch` in prepare, and `create-github-release`,
  `move-latest-tag`, and `continue-development` in release - runs only git/gh,
  plus `npm version` and a first-party script in `continue-development`; none
  runs `yarn install`, so no third-party code executes alongside a write token.
  `deploy` installs nothing and holds the npm-publish OIDC alone.
  `--ignore-scripts` on publish is still load-bearing.
- **`build` holds `id-token: write` for the Artifactory exchange, so a
  compromised dependency there could mint an OIDC token for any audience,
  including npm's.** This is bounded externally: npm's trusted publisher
  validates the workflow file path and environment, and a token minted in
  `build` carries `workflow_ref` = `prepare-release.yml` (not `release.yml`) with
  no environment, so npm rejects it. Keeping `yarn install` out of `release.yml`
  is what preserves this - a dependency install there would mint tokens the
  publisher accepts.
- **The build-output poisoning path is unchanged** and remains the top
  unmitigated risk. A dependency-vulnerability gate is still the intended
  mitigation and still does not exist.

## Open items

- **The npm trusted publisher validates the repository, the workflow file path
  (`.github/workflows/release.yml`), and the `production` environment** - not the
  trigger and not the git ref. The environment claim is **required**, not
  optional: it is mandated by the platform team and is the control that makes the
  `production` approval un-bypassable under run-from-branch (see Security
  posture). `workflow_dispatch` on a branch satisfies the publisher exactly as a
  tag-triggered run did, provided the workflow path and the environment match.
- **The `production` environment's deployment-ref rule, if set, must allow the
  release branches.** This is the one ref-sensitive control, and it is on the
  GitHub side, not npm. The publish flow ran on a tag, so it needed a tag
  pattern; the dispatch flow runs on `refs/heads/release/<version>`, so an
  enabled "deployment branches and tags" rule needs a branch pattern like
  `release/*`. Leaving the rule unset (any ref may deploy) also works - the
  required-reviewers gate is independent of it.
- **A true old-line backport branch will not carry `release.yml`.** Because the
  run is dispatched *from* the branch, the branch must contain the workflow. A
  branch cut from current `main` has it; a branch based on a pre-pipeline
  release line does not, and the workflow would need to be added there first.
  Accepted as a known boundary of running from the branch.
- Carried over from the publish flow and still open: the `production`
  environment must exist; the dependency-vulnerability gate is missing; `jq` and
  `gh` are assumed present on the runner group (`gh` drives
  `create-github-release`, and because it runs after the irreversible publish, a
  missing `gh` leaves a published package with no tag or Release); the Artifactory
  token-shape guard in the composite action needs a field test against a real
  token.
