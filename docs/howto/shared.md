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
  rather than from NPM.  See our [yarn-link.md][].

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
  `@zulip/shared` version to NPM.  Tag the commit like `shared-0.0.N`;
  see the history of `static/shared/package.json` for examples.

* Once the new `@zulip/shared` version is on NPM, you can update our
  `package.json` in your zulip-mobile PR to point to that version, and
  mark the PR as ready (non-draft).
