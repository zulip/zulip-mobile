# shellcheck shell=bash
#
# Usage:
#   . ensure-coreutils.sh
#
# Ensures GNU coreutils are available in PATH.
# May add to PATH, or exit with a message to stderr.
#
# The GNU coreutils are a basic piece of infrastructure for having
# a reasonable 21st-century shell scripting environment, so we
# freely invoke this in any of our scripts that need `readlink -f`
# or other features not always found without them.
#
# On any GNU/Linux system this is of course a non-issue.  Likewise
# on Windows: we inevitably require Git, and Git for Windows comes
# with a GNU environment called "Git BASH", based on MSYS2.
#
# So this is really all about macOS.  Fortunately it's easy to get
# coreutils installed there too... plus, many people already have
# it installed but just not in their PATH.  We write our scripts
# for a GNU environment, so we bring it into the PATH.

# Check, silently, for a working coreutils on the PATH.
check_coreutils() {
    # Check a couple of commands for GNU-style --help and --version,
    # which macOS's default BSD-based implementations don't understand.
    fmt --help >/dev/null 2>&1
    readlink --version 2>&1 | grep -q GNU
}

# Either get Homebrew's coreutils on the PATH, or error out.
try_homebrew() {
    local homebrew_prefix="$1"

    # Homebrew provides names like `greadlink` on the PATH,
    # but also provides the standard names in this directory.
    homebrew_gnubin="${homebrew_prefix}"/opt/coreutils/libexec/gnubin
    if ! [ -d "${homebrew_gnubin}" ]; then
        cat >&2 <<EOF
This script requires GNU coreutils.

Found Homebrew at:
  ${homebrew_prefix}
but no coreutils at:
  ${homebrew_gnubin}

Try installing coreutils with:
  brew install coreutils
EOF
        return 2
    fi

    export PATH="${homebrew_gnubin}":"$PATH"
    if ! check_coreutils; then
        cat >&2 <<EOF
This script requires GNU coreutils.

Found Homebrew installation of coreutils at:
  ${homebrew_gnubin}
but it doesn't seem to work.

Please report this in #mobile-dev-help on https://chat.zulip.org/
and we'll help debug.
EOF
        return 2
    fi
}

ensure_coreutils() {
    # If we already have it, then great.
    check_coreutils && return

    # Else try finding a Homebrew install of coreutils,
    # and putting that on the PATH.
    homebrew_prefix=$(brew --prefix || :)
    if [ -n "${homebrew_prefix}" ]; then
        # Found Homebrew.  Either use that, or if we can't then
        # print an error with Homebrew-specific instructions.
        try_homebrew "${homebrew_prefix}"
        return
    fi

    cat >&2 <<EOF
This script requires GNU coreutils.

Install from upstream:
  https://www.gnu.org/software/coreutils/
or from your favorite package manager.

If you have any questions, ask in #mobile-dev-help on https://chat.zulip.org/
and we'll be happy to help.
EOF
    return 2
}

ensure_coreutils || exit
