# CI workflows

## Repository settings

The workflows read these repository secrets and variables. A job fails with an
error naming the missing setting when one of these settings is empty.

| Name | Kind | Used by | Purpose |
| --- | --- | --- | --- |
| `ARTIFACTORY_URL` | variable | every job that installs dependencies | Artifactory base URL for the OIDC exchange and the package registry |
| `E2E_CREDENTIAL_VENDOR_URL` | secret | `upload-*`, `e2e-*` in `ci.yml` | Endpoint of the RN Service, described below |
| `E2E_CREDENTIAL_VENDOR_AUDIENCE` | variable | `upload-*`, `e2e-*` in `ci.yml` | Audience of the GitHub OIDC token sent to the RN Service |
| `SAUCE_UPLOAD_URL` | variable | `upload-*` in `ci.yml` | SauceLabs app storage upload endpoint |
| `SAUCE_HOSTNAME` | variable | `e2e-*` in `ci.yml` | SauceLabs Appium hostname for the orchestrator |
| `SAUCE_PORT` | variable | `e2e-*` in `ci.yml` | SauceLabs Appium port for the orchestrator. Must be numeric. |
| `SAUCE_BASE_URL` | variable | `e2e-*` in `ci.yml` | SauceLabs Appium base path for the orchestrator |

## RN Service

The RN Service is the credential vendor at `E2E_CREDENTIAL_VENDOR_URL`. CI holds
no SauceLabs or Twilio credentials of its own. Each job that needs a credential
requests a GitHub OIDC token for `E2E_CREDENTIAL_VENDOR_AUDIENCE` and sends the
token to the RN Service.

CI calls two RN Service actions.

- `get-saucelabs-credentials` returns the SauceLabs service account. The
  `saucelabs-upload` and `e2e-credentials` actions call it.
- `mint-voice-token` returns the Voice access token that the harness app dials
  with. The `e2e-credentials` action calls it with a ttl of 3600 seconds.

A job that calls the RN Service needs `permissions: id-token: write`.
