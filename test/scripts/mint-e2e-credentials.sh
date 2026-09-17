#!/usr/bin/env bash
# Mint the short-lived credentials every e2e run needs.
#
# Shared by every runner so they cannot drift. A runner that does not mint TURN
# credentials leaves the ice-test valid-* variants running against whatever a
# previous run left behind. Those carry a one hour TTL, so they fail rather than
# skip once expired, which reads as an SDK fault.
#
# Usage: mint-e2e-credentials.sh <repo-root>
set -uo pipefail

REPO="${1:?usage: mint-e2e-credentials.sh <repo-root>}"

if [ ! -f "$REPO/test/e2e.env" ]; then
  echo "    no test/e2e.env; reusing any existing credentials" >&2
  exit 0
fi

set -a; . "$REPO/test/e2e.env"; set +a

# Access tokens carry a one hour TTL. A token from an earlier run expires
# mid-run and every call suite fails with AccessTokenExpired (20104).
node -e "
  const twilio = require('$REPO/node_modules/twilio');
  const { AccessToken } = twilio.jwt;
  const t = new AccessToken(
    process.env.ACCOUNT_SID,
    process.env.API_KEY_SID,
    process.env.API_KEY_SECRET,
    { identity: process.env.CLIENT_IDENTITY, ttl: 3600 }
  );
  t.addGrant(new AccessToken.VoiceGrant({
    incomingAllow: true,
    outgoingApplicationSid: process.env.OUTGOING_APPLICATION_SID,
  }));
  require('fs').writeFileSync(
    '$REPO/test/appium-orchestrator/token.json',
    JSON.stringify({ accessToken: t.toJwt() }, null, 2)
  );
  console.error('    access token minted for ' + process.env.CLIENT_IDENTITY);
"

# Network Traversal Service issues short-lived TURN credentials. Without fresh
# ones the ice-test valid-* variants either skip or fail on expiry.
node -e "
  const twilio = require('$REPO/node_modules/twilio');
  const c = twilio(process.env.ACCOUNT_SID, process.env.AUTH_TOKEN);
  const out = '$REPO/test/appium-harness/src/utilities/token/e2e-tests-ice-server.ts';
  c.tokens.create({ ttl: 3600 }).then((t) => {
    const servers = t.iceServers || [];
    const urlOf = (s) => s.url || s.urls;
    // E2E_TURN_TRANSPORT selects udp or tcp. Relay-only connections succeed on
    // Android and time out on iOS over udp; forcing tcp separates a blocked
    // udp path on the phone's network from a platform defect.
    const wanted = process.env.E2E_TURN_TRANSPORT || 'udp';
    const re = new RegExp('transport=' + wanted);
    const turn = servers.find((s) => /^turn:/.test(urlOf(s)) && re.test(urlOf(s)))
              || servers.find((s) => /^turn:/.test(urlOf(s)));
    if (!turn) {
      console.error('    no TURN server returned; valid-* variants will skip');
      return;
    }
    require('fs').writeFileSync(out,
      '// Generated per run. Gitignored. One hour TTL.\n' +
      'export const iceServer = ' + JSON.stringify({
        serverUrl: urlOf(turn),
        username: turn.username,
        password: turn.credential,
      }, null, 2) + ';\n');
    console.error('    TURN credentials minted');
  }).catch((e) => console.error('    TURN mint failed: ' + e.message));
"
