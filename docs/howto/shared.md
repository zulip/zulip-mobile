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
  `@zulip/shared` version to NPM.  See section below.

* Once the new `@zulip/shared` version is on NPM, you can update our
  `package.json` in your zulip-mobile PR to point to that version, and
  mark the PR as ready (non-draft).


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

To add you as a new maintainer on NPM, an existing maintainer will add
you [here][npm-zulip-team] for access to everything in `@zulip`, and
[here][npm-zulip-md-p-access] for access to the legacy
`zulip-markdown-parser` package (until we eliminate it; see
#4242.)

[npm-zulip-team]: https://www.npmjs.com/settings/zulip/teams/team/developers/users
[npm-zulip-md-p-access]: https://www.npmjs.com/package/zulip-markdown-parser/access

You'll also need to run `npm adduser` on your development machine and
follow the prompts to authenticate.  This will create a `~/.npmrc`
file with an auth token, which `npm publish` will automatically use.
