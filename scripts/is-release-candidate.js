/**
 * Given a semver version string, returns whether it's a release candidate
 * (bare X.Y.Z-rcN, or compound X.Y.Z-preview.N-rcM/X.Y.Z-betaN-rcM).
 * Detected by checking the version's last hyphen-delimited segment.
 */
function isReleaseCandidate(version) {
  const lastSegment = version.slice(version.lastIndexOf('-') + 1);
  return /^rc[0-9]+$/.test(lastSegment);
}

function main() {
  const version = process.argv[2];

  if (!version) {
    throw new Error('Version argument required.');
  }

  console.log(isReleaseCandidate(version) ? 'true' : 'false');
}

module.exports = { isReleaseCandidate };

if (require.main === module) {
  try {
    main();
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
  }
}
