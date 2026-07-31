/**
 * Classifies a release version tag for the publish pipeline.
 *
 * Usage:
 *   node ./scripts/classify-version-tag.js getNpmDistTag 2.0.0-preview.1
 *   node ./scripts/classify-version-tag.js getIsReleaseCandidate 2.0.0-rc2
 */

/**
 * A trailing release-candidate suffix, e.g. the `-rc1` in
 * `2.0.0-preview.1-rc1`. Always the last segment when present.
 */
const RELEASE_CANDIDATE_SUFFIX = /-rc[0-9]+$/;

/**
 * A prerelease channel identifier and its number, e.g. the `beta` in
 * `1.0.0-beta.2`. The dot is not optional: `beta.2` parses but `beta2` does not
 * parse.
 */
const PRERELEASE_CHANNEL = /^[0-9]+\.[0-9]+\.[0-9]+-([a-z]+)\.[0-9]+$/;

/** A version with no prerelease identifier at all, e.g. `1.6.1`. */
const FINAL_VERSION = /^[0-9]+\.[0-9]+\.[0-9]+$/;

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
 * Publishing policy: the npm dist-tag each channel goes out under. Release
 * candidates are not listed because they are never published - see
 * getNpmDistTag.
 *
 * Note that this value is passed directly to the `npm publish` CLI command as
 * the value for the `--tag` flag.
 */
const NPM_DIST_TAG_BY_CHANNEL = {
  [CHANNELS.final]: 'latest',
  [CHANNELS.beta]: 'beta',
  [CHANNELS.preview]: 'preview',
};

/**
 * Describes what a version tag is, independent of any publishing policy.
 *
 *   1.6.1               -> { channel: 'final',   isReleaseCandidate: false }
 *   1.0.0-beta.2        -> { channel: 'beta',    isReleaseCandidate: false }
 *   2.0.0-rc2           -> { channel: 'final',   isReleaseCandidate: true }
 *   2.0.0-preview.1-rc1 -> { channel: 'preview', isReleaseCandidate: true }
 *
 * `channel` is what the version is a release of, or a candidate for when
 * isReleaseCandidate is true. So a bare `2.0.0-rc2` is a candidate for the
 * final 2.0.0, and `2.0.0-preview.1-rc1` is a candidate for that preview.
 *
 * The release-candidate suffix is removed before reading the channel. One
 * regex covering both would be ambiguous: in `2.0.0-rc2` the channel group
 * would capture `rc` as though it were a channel like `beta`.
 *
 * Throws on any shape not recognized here, rather than guessing. Guessing
 * would risk a prerelease publishing under the `latest` dist-tag.
 */
function classifyVersionTag(version) {
  // First, check if the version is an RC by checking for post-fix `-rcN` where
  // `N` is a required number >= 0.
  const isReleaseCandidate = RELEASE_CANDIDATE_SUFFIX.test(version);

  // Now, remove the `-rcN` substring from the end so that the channel can be
  // parsed.
  const released = version.replace(RELEASE_CANDIDATE_SUFFIX, '');

  // Next, get the release channel specified by the version string.
  const channelMatch = released.match(PRERELEASE_CHANNEL);

  if (channelMatch) {
    if (![CHANNELS.beta, CHANNELS.preview].includes(channelMatch[1])) {
      throw new Error(`Unrecognized version tag "${version}".`);
    }

    return { channel: CHANNELS[channelMatch[1]], isReleaseCandidate };
  }

  // If there was no recognized release channel or no release channel at all,
  // make sure it's a valid final semver.
  if (FINAL_VERSION.test(released)) {
    return { channel: CHANNELS.final, isReleaseCandidate };
  }

  throw new Error(`Unrecognized version tag "${version}".`);
}

/**
 * Whether a version is a release candidate, including compound forms like
 * `2.0.0-preview.1-rc1`. Release candidates are cut for QE regression testing
 * and are never published to npm.
 */
function getIsReleaseCandidate(version) {
  return classifyVersionTag(version).isReleaseCandidate;
}

/**
 * The npm dist-tag to publish a version under.
 *
 * We want to throw an error if we try to get the npm dist-tag for an RC because
 * we absolutely do not want to publish release candidates.
 */
function getNpmDistTag(version) {
  const { channel, isReleaseCandidate } = classifyVersionTag(version);

  if (isReleaseCandidate) {
    throw new Error(
      `Version "${version}" is a release candidate and has no npm dist-tag.`
    );
  }

  if (!Object.keys(NPM_DIST_TAG_BY_CHANNEL).includes(channel)) {
    throw new Error(
      `No npm dist-tag configured for channel "${channel}". Add it to ` +
        'NPM_DIST_TAG_BY_CHANNEL if this is a channel we publish.'
    );
  }

  return NPM_DIST_TAG_BY_CHANNEL[channel];
}

const COMMANDS = { getNpmDistTag, getIsReleaseCandidate };

/**
 * Runs a command by name and returns exactly what the CLI should print.
 *
 * Returns a string rather than the underlying value so the wrapper below stays
 * a pure passthrough. That keeps everything worth testing in here, where jest
 * can assert character for character what the release workflow reads off
 * stdout.
 */
function runCommand(command, version) {
  if (!Object.keys(COMMANDS).includes(command)) {
    throw new Error(
      `Invalid command. Must be one of "[${Object.keys(COMMANDS).join(', ')}]".`
    );
  }

  if (!version) {
    throw new Error('No version value passed.');
  }

  return String(COMMANDS[command](version));
}

module.exports = {
  classifyVersionTag,
  getIsReleaseCandidate,
  getNpmDistTag,
  runCommand,
};

if (require.main === module) {
  try {
    console.log(runCommand(process.argv[2], process.argv[3]));
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
  }
}
