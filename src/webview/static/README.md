# Webview static files

This directory holds static files to be packaged for use by the embedded
WebView.  These files are copied out to the packaged application
at build time.

The list of files to be packaged from here lives in the `tools/build-webview`
script, at the end.  When adding a file here, add it to that list too.

Although the files in this directory are static at _runtime_, some of them may
still be generated dynamically at _build time_. Such files should not be tracked
in the Git repository, but instead rebuilt as needed; see [the build-webview
script][build-webview] for an appropriate hook.

[build-webview]: ../../../tools/build-webview

_N.B._: When editing and testing, changes made to this directory will **not** be
uploaded to an emulator after a mere reload! You must perform a rebuild
(`react-native run-${TARGET}`) to repackage any new or altered assets.