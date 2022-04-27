# Sharing code from the webapp

The mobile app and webapp have to do a lot of the same things (both
being Zulip clients), and are both written in JavaScript.  So we've
begun taking the opportunity to share code between them.

The shared code lives in the zulip/zulip repo under `static/shared/`.
It's published to NPM as the package `@zulip/shared`.


## How to use a new shared feature

* The code in question needs to be moved from `static/js/` to
  `static/shared/js/`.  This often requires a bit of refactoring to
  make it an ES6 module and make it not depend on anything in the
  webapp code that isn't already shared.  Typically this step is done
  by someone who works regularly in the web frontend.  The remaining
  steps are typically done by someone working mainly on mobile.

* To develop and test the shared code, use `yarn link` so that the
  shared code comes from your local zulip/zulip worktree (just like
  the mobile app code comes from your local zulip-mobile worktree)
  rather than from NPM.  See our [yarn-link.md](yarn-link.md).

* For a new module `static/shared/js/foo.js`, you'll typically want to
  add a file `foo.js.flow` next to it with type definitions.  See
  existing examples.

* You may also find you want to make some changes to the module's
  interface, in order to make it fit better in the mobile app as well
  as the webapp.  Go ahead and do these; just update the callsites
  within the webapp to match, and test the webapp with your changes.

* When you have the shared code in a state you're happy with, send a
  PR in zulip/zulip with any changes needed.

  At this stage it's also helpful to post a draft PR in zulip-mobile
  with your changes there to start using the shared code.  Just note
  that it's based on your @zulip/shared changes, and link to the
  zulip/zulip PR.  A reviewer can reproduce your setup by checking out
  both PRs and using `yarn link` themselves.

* Once your changes in zulip/zulip are merged, publish a new
  `@zulip/shared` version to NPM.  See [section below](#publish).

* Once the new `@zulip/shared` version is on NPM, you can update our
  `package.json` in your zulip-mobile PR to point to that version, and
  mark the PR as ready (non-draft).

  * Note that in case there have been other changes in the shared
    code, we'll want to test that upgrade; see [section
    below](#update).

    You can also do that testing before your `@zulip/shared` changes
    are complete, in order to catch early anything we need to fix from
    the accumulated changes since the last `@zulip/shared` update.


<div id="update" />

## How to update our version of the shared code

When updating the version of `@zulip/shared` we use, we check that the
changes don't introduce bugs or incompatibilities.  This risk may be
higher than it is with a random external dependency; after all, the
code in the `@zulip/shared` package has a grand total of two
consumers, namely the Zulip mobile app and webapp.

To make and test an update:

* Start using the new `@zulip/shared` version.

  * If the new version has been published on NPM, just update
    `package.json` as usual.

  * Otherwise, use `yarn link` so that the shared code comes from your
    local zulip/zulip worktree (just like the mobile app code comes
    from your local zulip-mobile worktree) rather than from NPM.  See
    our [yarn-link.md](yarn-link.md).

* Run our test suite: `tools/test --all`.

* Look at what's changed in the shared code since the version we're
  currently using.  For example, if we've been using version 0.0.6 and
  you're upgrading to 0.0.7, then run the following commands in your
  zulip/zulip worktree:

      $ git diff --stat -p shared-0.0.6 shared-0.0.7 -- static/shared/
      $ git log --stat -p shared-0.0.6..shared-0.0.7 -- static/shared/

  Look for changes that affect code we may already be using.  There
  may be modules present which we aren't yet using.

* If any code has changed, then manually test the app.

  * Try to exercise each of the changed areas of code in particular:
    for example, if `typing_status.js` changed, then go to a PM
    conversation and check that sending and receiving typing-status
    indicators still works.

  * If the changes are trivial, this may be cursory.

* If something does break, then debug the issue.  The fix may require
  changes in either or both of zulip/zulip and zulip-mobile.

* Once all's well, send a PR with the upgrade.

  * The upgrade (editing `package.json` and `yarn.lock`) should be in
    a commit by itself, or squashed together only with changes that
    have to happen simultaneously.  Where possible, fixes should go in
    separate commits before the upgrade.

  * The upgrade may be in the same PR with other changes.  Typically,
    if you're upgrading in order to use a new feature, the upgrade
    will come in the same PR where you go on to use the new feature.

  * If there wasn't already a `@zulip/shared` release on NPM with the
    version you want (i.e. if you needed to use `yarn link`), we'll
    need to publish one; see [section below](#publish).


<div id="publish" />

## Publishing `@zulip/shared` to NPM

In order to use a new version of the shared code (beyond local
development -- i.e., in order to *merge* a change to start using a new
version of the shared code), we publish it to NPM.

This looks something like:
```
$ cd ~/z/zulip  # your zulip.git clone, wherever it is
$ cd static/shared  # the root of the @zulip/shared package's source
$ git checkout main
$ git pull --ff-only

   # (These steps can probably become a `version` NPM script.)
$ npm version patch --no-git-tag-version
   # Suppose the new version is 0.0.3.  Then:
$ git commit -am 'shared: Bump version to 0.0.3.'
$ git tag shared-0.0.3

$ git log --stat -p upstream/main..  # check your work!
$ git push upstream main shared-0.0.3

$ npm publish --dry-run  # check your work!
$ npm publish  # should prompt for an OTP, from your 2FA setup
```

Note the convention for the name of the Git tag.  Because we don't
organize our version control around NPM and this package isn't the
only thing in its Git repo, we use tags like `shared-0.0.3` instead of
NPM's built-in behavior of `v0.0.3`.


### Initial setup

To get access to publish to `@zulip` on NPM, ask another maintainer to
add you.  (This will only make sense if you're already a maintainer,
i.e. you regularly merge PRs.)

You'll want to make an account on npmjs.com if you haven't already.
The Zulip project also requires that you [set up 2FA][npm-docs-2fa]
before your account is given write access.

[npm-docs-2fa]: https://docs.npmjs.com/configuring-two-factor-authentication

To add you as a new maintainer on NPM, an existing maintainer will
invite you to the [NPM `zulip` organization][npm-zulip-org].  In that
organization, the [`mobile-shared` team][npm-zulip-mobile-shared] has
access to `@zulip/shared`, and the [`developers`
team][npm-zulip-developers] has access to all our packages.

[npm-zulip-org]: https://www.npmjs.com/settings/zulip/members
[npm-zulip-mobile-shared]: https://www.npmjs.com/settings/zulip/teams/team/mobile-shared/users
[npm-zulip-developers]: https://www.npmjs.com/settings/zulip/teams/team/developers/users

You'll also need to run `npm adduser` on your development machine and
follow the prompts to authenticate.  This will create a `~/.npmrc`
file with an auth token, which `npm publish` will automatically use.
