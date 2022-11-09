# All our non-NPM dependencies and dev-dependencies, expressed with Nix.
#
# TODO: Expand this to cover the full Android dev environment,
#   and everything in tools/.
#
# If you're using NixOS, this file may be helpful:
#  * Type `nix-shell` in this directory.
#  * You'll get a shell with the environment all set up
#    so that `yarn install` and `tools/test --all` work.
#  * Also `android-studio`, and from there you can run the
#    Android emulator and build and run the app:
#    * Start emulator from Android Studio.
#    * Run `adb reverse tcp:8081 tcp:8081` in the shell.
#    * Run `node_modules/.bin/react-native start` in the shell.
#    * Run the app from Android Studio.
#
# If you're using any other Linux distro, or macOS, or Windows, see
# our setup instructions at `docs/howto/build-run.md`.  But possibly
# this is a useful reference for some of our dependencies.  (Note
# that you almost certainly already have the more obscure of these
# dependencies already, namely ncurses and the C++ standard library.)

# For developing changes to this file, use `nix-shell --pure --run`
# to check that the dependencies here are complete, without relying
# on things that happen to be in your local environment.  E.g.:
#
#   $ nix-shell --pure --run 'yarn && tools/test --all'

{ pkgs ? import <nixpkgs> {} }:
with pkgs;
mkShell {

  nativeBuildInputs = [
    nodejs-16_x
    yarn

    jdk11
    android-studio

    # Used by various `tools/` scripts:
    git
    jq
    perl
    rsync

    ncurses  # Used by Flow (via the `tset` binary)

    vscode
  ];

  LD_LIBRARY_PATH = lib.makeLibraryPath [
    gcc11.cc  # Needed by Flow (the one from NPM.)
  ];
}
