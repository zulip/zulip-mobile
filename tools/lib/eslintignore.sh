# shellcheck shell=bash

# Filter out filenames excluded by our .eslintignore.
#
# Filenames are expected as arguments, and printed, leaving out those that
# should be ignored.
#
# (This is a workaround: the ideal solution would be for ESLint to accept an
# option saying to apply its ignore rules and to not worry if that filters
# out some or all of the files we named, and then we wouldn't need this.)
apply_eslintignore() {
    # This uses only the .eslintignore file at the root.  It relies on us
    # having no other sources of ESLint file ignores: other .eslintignore
    # files, `ignorePatterns` in the eslintrc, etc.
    #
    # But if we do, the worst case is that we'll reintroduce #5081: the
    # interactive `tools/test` (never CI) will fail when one of those
    # ignored files is touched, because of an awkward CLI choice in ESLint.

    # ESLint ignore files are documented as having the gitignore syntax:
    #   https://eslint.org/docs/user-guide/configuring/ignoring-code
    # So we ask Git to interpret the file for us.  The main limitation is
    # that while we can tell it one file to apply, we can't give it several,
    # or tell it to look for .eslintignore files throughout the tree.
    #
    # The `git check-ignore` command wants to tell us what files have been
    # excluded, not included.  With `-nv` it gives us both and we can
    # extract which is which.
    (( $# )) || return 0  # if no arguments, no output
    git -c core.excludesFile=.eslintignore check-ignore --no-index -nv "$@" \
    | perl -lne 'print if (s/^::\t//)'
}
