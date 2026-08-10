/**
 * Classifies a release version tag for the publish pipeline.
 *
 * In real usage, <MAKE_LATEST> is typically passed from GitHub Actions. It is a
 * string valued "true", "false", or "legacy". The value is "true" when a
 * GitHub release is cut and the checkbox for "Set as latest version" is checked
 * true. Only "true" and "false" are accepted here - see getNpmDistTag for why
 * "legacy" is rejected.
 *
 * Usage:
 *   node ./scripts/classify-version-tag.js getIsReleaseCandidate <VERSION>
 *   node ./scripts/classify-version-tag.js getReleaseChannel <VERSION>
 *   node ./scripts/classify-version-tag.js getNpmDistTag <VERSION> <MAKE_LATEST>
 */

/**
 * Regular expression patterns used to process version tags.
 */
const REGEX_PATTERNS = {
  /**
   * A trailing release-candidate suffix, e.g. the `-rc1` in
   * `2.0.0-preview.1-rc1`. Always the last segment when present.
   */
  RELEASE_CANDIDATE_SUFFIX: /-rc([0-9]+)$/,

  /**
   * A version that will be published to the beta channel, e.g. `1.0.0-beta.4`.
   */
  BETA_CHANNEL_VERSION: /^([0-9]+)\.([0-9]+)\.([0-9]+)-beta\.([0-9]+)$/,

  /**
   * A version that will be published to the preview channel,
   * e.g. `2.0.0-preview.2`.
   */
  PREVIEW_CHANNEL_VERSION: /^([0-9]+)\.([0-9]+)\.([0-9]+)-preview\.([0-9]+)$/,

  /**
   * A version with no prerelease identifier at all, e.g. `1.6.1`.
   */
  FINAL_VERSION: /^([0-9]+)\.([0-9]+)\.([0-9]+)$/,
};

/**
 * Expected channels to be parsed out of the semver.
 *
 * Note that the "final" channel is implied. Rather, it is the fallback for a
 * version that does not specify a channel, such as `2.0.0` or `2.0.0-rc2`.
 */
const CHANNELS = {
  final: 'final',
  beta: 'beta',
  preview: 'preview',
};

/**
 * Correlate release channels with npm dist-tag values.
 */
const NPM_DIST_TAG = {
  [CHANNELS.final]: 'latest',
  [CHANNELS.beta]: 'beta',
  [CHANNELS.preview]: 'preview',
};

/**
 * Correlate the RegExp patterns with release channels.
 *
 * A version matching no entry is rejected rather than assigned a channel, so
 * adding a channel means adding a pattern here.
 *
 * @type {[RegExp, string][]}
 */
const versionPatternChannelMapping = [
  [REGEX_PATTERNS.BETA_CHANNEL_VERSION, CHANNELS.beta],
  [REGEX_PATTERNS.PREVIEW_CHANNEL_VERSION, CHANNELS.preview],
  [REGEX_PATTERNS.FINAL_VERSION, CHANNELS.final],
];

/**
 * Classifies a version tag.
 *
 * Returns the release candidacy of the version, the release channel of the
 * version, and the raw RegExp match of the version.
 *
 *   1.6.1               -> final,   not a candidate
 *   1.0.0-beta.2        -> beta,    not a candidate
 *   2.0.0-rc2           -> final,   candidate
 *   2.0.0-preview.1-rc1 -> preview, candidate
 *
 * `2.0.0-rc2` is a candidate for the final `2.0.0` version and
 * `2.0.0-preview.1-rc1` is a candidate for the preview `2.0.0-preview.1`
 * version.
 *
 * Throws on any shape not listed above rather than guessing, because a guessed
 * channel could put a prerelease on the `latest` dist-tag.
 *
 * @param {string} version
 * @returns {{
 *   match: RegExpMatchArray,
 *   channel: string,
 *   isReleaseCandidate: boolean,
 * }}
 */
function classifyVersionTag(version) {
  // First, check if the version is an RC by checking for post-fix `-rcN` where
  // `N` is a required number >= 0.
  const isReleaseCandidate =
    REGEX_PATTERNS.RELEASE_CANDIDATE_SUFFIX.test(version);

  // Now, remove the `-rcN` substring from the end so that the channel can be
  // parsed.
  const targetVersion = version.replace(
    REGEX_PATTERNS.RELEASE_CANDIDATE_SUFFIX,
    ''
  );

  // Check expected version patterns one at a time.
  for (const [versionPattern, versionChannel] of versionPatternChannelMapping) {
    const versionMatch = targetVersion.match(versionPattern);
    if (versionMatch) {
      return {
        match: versionMatch,
        channel: versionChannel,
        isReleaseCandidate,
      };
    }
  }

  // If we didn't hit a very explicitly expected version pattern, throw an
  // error.
  throw new Error(`Unrecognized version "${version}".`);
}

/**
 * Whether a version is a release candidate, including compound forms like
 * `2.0.0-preview.1-rc1`.
 *
 * Candidates are cut for QE regression testing and are never published to npm,
 * so this is the only command that accepts one - the other two throw. The
 * workflows call it first and use the answer to decide whether to go on.
 *
 * @param {string} version
 * @returns {boolean}
 */
function getIsReleaseCandidate(version) {
  return classifyVersionTag(version).isReleaseCandidate;
}

/**
 * The channel a version belongs to.
 *
 * Deliberately independent of the latest-release checkbox, because a channel is
 * a property of the version itself.
 *
 * Throws for a release candidate. Reporting a channel here would incorrectly
 * conflate a release candidate with a full release channel.
 *
 * @param {string} version
 * @returns {string}
 */
function getReleaseChannel(version) {
  const { channel, isReleaseCandidate } = classifyVersionTag(version);

  if (isReleaseCandidate) {
    throw new Error(
      `Version "${version}" is a release candidate and has no release channel.`
    );
  }

  return channel;
}

/**
 * The dist-tag a version publishes under, passed straight to `npm publish` as
 * the value of its `--tag` flag.
 *
 * `makeLatest` is required for every version even though it only changes the
 * answer for a "final" one.
 *
 * A final version with `makeLatest` of "false" is a backport onto an older
 * line. It gets `<major>.<minor>.x` instead of `latest`, so a bare
 * `npm install` keeps resolving to the newer line. Consumers still reach the
 * backport through semver ranges - a dist-tag only affects
 * `npm install <pkg>` and `npm install <pkg>@<dist-tag>`.
 *
 * `makeLatest` with value "legacy" will throw an error. Under "legacy", GitHub
 * infers the latest release by date rather than by flag, which is not an intent
 * this pipeline should act on.
 *
 * @param {string} version
 * @param {string} makeLatest
 * @returns {string}
 */
function getNpmDistTag(version, makeLatest) {
  const { match, channel, isReleaseCandidate } = classifyVersionTag(version);

  if (isReleaseCandidate) {
    throw new Error(
      `Version "${version}" is a release candidate and has no npm dist-tag.`
    );
  }

  if (!['true', 'false'].includes(makeLatest)) {
    throw new Error(
      `Unexpected value "${makeLatest}" for parameter "makeLatest".`
    );
  }

  if (channel === CHANNELS.final && makeLatest === 'false') {
    const [, majorVersion, minorVersion] = match;
    return `${majorVersion}.${minorVersion}.x`;
  }

  return NPM_DIST_TAG[channel];
}

/**
 * Runs a command by name and returns exactly what the CLI should print.
 *
 * The only export, and the only thing the workflows invoke, so it is also the
 * only surface the unit tests need to cover.
 *
 * @param {string} command
 * @param {...string} args
 * @returns {string | boolean}
 */
function runCommand(command, ...args) {
  switch (command) {
    case getIsReleaseCandidate.name: {
      const [version] = args;
      if (!version) {
        throw new Error('Expected version argument.');
      }
      return getIsReleaseCandidate(version);
    }
    case getReleaseChannel.name: {
      const [version] = args;
      if (!version) {
        throw new Error('Expected version argument.');
      }
      return getReleaseChannel(version);
    }
    case getNpmDistTag.name: {
      const [version, makeLatest] = args;
      if (!version || !makeLatest) {
        throw new Error('Expected "version" and "makeLatest" arguments.');
      }
      return getNpmDistTag(version, makeLatest);
    }
    default: {
      throw new Error('Unexpected command.');
    }
  }
}

module.exports = { runCommand };

if (require.main === module) {
  try {
    console.log(runCommand(...process.argv.slice(2)));
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
  }
}
