#!/bin/bash
set -e

echo "Downloading pirlo-cli tool"
curl -s -o pirlo-cli \
  https://pirlo-downloads.s3-us-west-1.amazonaws.com/pirlo-cli/pirlo-cli
chmod a+x pirlo-cli

echo "Initiating a new automated test run."
./pirlo-cli run -k jNmWe3iFhWjvSy_SCjlvLsCWgfw= \
  android/app/build/outputs/apk/release/app-release.apk
