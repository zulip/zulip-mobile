# Our version of React Native

We maintain our own version of React Native, in order to be able to apply
fixes before they make it into an upstream release.  (As of this writing, we
don't yet actually build our app from our version -- we use a released
version of RN -- but we plan to do that soon.)

Our repo is [zulip/react-native](https://github.com/zulip/react-native) on
GitHub.

The workflow within that repo is:

* Branch **0.N.M-zulip** begins at commit **v0.N.M** from upstream, and adds
  some commits of our own (or of our own choosing, potentially contributed
  by other people in PRs to React Native.)  For example, `0.55.4-zulip` is a
  branch on top of `v0.55.4`, which is the tag for the 0.55.4 release.

* Each of these branches works a lot like the `main` branch in this
  zulip/zulip-mobile repo or in the zulip/zulip repo.  The branch is a
  linear sequence of commits, with no merges; and it advances only by adding
  new commits, never by rebasing or rewinding.

* Contributing to one of these branches works just like contributing to
  `main` in this zulip/zulip-mobile repo; prepare a branch in your own
  GitHub fork, and send a PR.
