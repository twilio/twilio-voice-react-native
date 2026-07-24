/**
 * Given a semver version string, returns the npm dist-tag to publish under.
 *
 * Returns `rc` for a release candidate, including compound forms like
 * preview.1-rc1. Such a version is a candidate for preview, not a preview
 * release itself.
 *
 * Returns `latest` for a bare final version.
 *
 * Otherwise, returns the prerelease identifier (alpha/beta/preview).
 */
function getNpmDistTag(version) {
  if (/-rc[0-9]+$/.test(version)) {
    return 'rc';
  }

  const match = version.match(
    /^[0-9]+\.[0-9]+\.[0-9]+-([a-z]+)\.?[0-9]+(?:-.*)?$/
  );
  return match ? match[1] : 'latest';
}

function main() {
  const version = process.argv[2];

  if (!version) {
    throw new Error('Version argument required.');
  }

  console.log(getNpmDistTag(version));
}

module.exports = { getNpmDistTag };

if (require.main === module) {
  try {
    main();
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
  }
}
