# Usage:
#   . ensure-coreutils.sh
#
# Ensures GNU coreutils are available in PATH.
# May add to PATH, or exit with a message to stderr.
#
# We don't yet have good docs for handling failure here if on
# Windows or macOS, so until then this isn't suitable for scripts
# used in normal development -- only for maintainer-facing scripts.

check_coreutils() {
    fmt --help >/dev/null 2>&1
}

ensure_coreutils() {
    check_coreutils && return

    homebrew_gnubin=/usr/local/opt/coreutils/libexec/gnubin
    if [ -d "$homebrew_gnubin" ]; then
        export PATH="$homebrew_gnubin":"$PATH"
        check_coreutils && return
    fi

    cat >&2 <<EOF
This script requires GNU coreutils.

Install from your favorite package manager, or from:
  https://www.gnu.org/software/coreutils/
EOF
    return 2
}

ensure_coreutils || exit
