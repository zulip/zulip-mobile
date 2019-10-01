# Webview static files

This directory holds static files to be packaged for use by the embedded
WebView. Files herein (other than those named `README.md`) will be copied out to
the packaged application at build time.

Although the files in this directory are static at _runtime_, some of them may
still be generated dynamically at _build time_. Such files should not be tracked
in the Git repository, but instead rebuilt as needed; see [the build-webview
script][build-webview] for an appropriate hook.

[build-webview]: ../../../tools/build-webview

_N.B._: When editing and testing, changes made to this directory will **not** be
uploaded to an emulator after a mere reload! You must perform a rebuild
(`react-native run-${TARGET}`) to repackage any new or altered assets.