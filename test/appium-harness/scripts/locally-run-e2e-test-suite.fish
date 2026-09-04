#!/usr/bin/env fish

set -l package_name (jq -r .name package.json); or begin
  echo "could not read package.json file"
  exit 1
end

if not test "$package_name" = "twilio-voice-react-native-sdk-appium-harness"
  echo "not in appium harness folder"
  exit 1
end

function __cleanup --on-signal INT --on-process-exit %self
  command reset
end

set -l today (date +%Y-%m-%d); or exit 1

set -l now (date +%H-%M-%S); or exit 1

set -l log_folder "logs/$today/"

mkdir -p $log_folder; or exit 1

set -l test_suite_id $argv[1]

printf "export const defaultTestSuiteId = '%s';\n" $test_suite_id > src/utilities/config/e2e-tests-default-suite-id.ts

yarn run start 2>&1 | tee "$log_folder/$test_suite_id.$now.log"
