# Editing dependencies

Sometimes you want to make a change to the code of one of our
dependencies.


## As a quick hack

To make changes in `foolib` locally, you can always go find the
relevant file under `node_modules/foolib/` and edit it.

This sometimes works well if you just want to add a couple of
temporary lines for debugging.  (Be sure to clean up when finished, or
risk confusion!)

This approach rapidly gets messy, though, if you're making complex
changes or you want to send your changes upstream.


## Using `yarn link`

Happily, with only a little more effort than the quick hack, you can
use `yarn link` to get the dependency from a proper Git clone of the
dependency's source.  Then you have the full power of version control
for tracking your exact changes and sharing them.

See [upstream docs for `yarn link`][yarn-link].

[yarn-link]: https://yarnpkg.com/lang/en/docs/cli/link/

Example usage, for the `@zulip/shared` package:
```
$ cd ~/z/zulip  # your zulip.git clone, wherever it is
$ cd static/shared  # the root of the @zulip/shared package's source
$ yarn link

$ cd ~/z/mobile  # your zulip-mobile clone, wherever it is
$ yarn link @zulip/shared
$ yarn

    # Now node_modules/${package_name} is a symlink...
$ readlink node_modules/@zulip/shared
../../../../.config/yarn/link/@zulip/shared

    # ... to the worktree for the package source.
$ readlink -f node_modules/@zulip/shared
/home/greg/z/zulip/static/shared
```

When done, be sure to run `yarn unlink` to go back to letting the
dependency information in `package.json` and `yarn.lock` control the
version you get.


### Making our toolchain work

For `@zulip/shared` the following is already done.  For other
dependencies, it might not be.

Some tools in our toolchain -- notably Flow, Metro, and Jest, all of
them tools from Facebook used by React Native -- don't work out of the
box with `yarn link`.  We've handled this with changes to our config
for these tools.

If you use `yarn link` for a package, you should make sure the package
appears in two places where our config needs to mention it:
* `.flowconfig`
* `metro.config.js`
* (Not the Jest config; the fix there works without a list of these
  packages.)

Search for `@zulip/shared` in each file, and add a similar entry for
the package you're using `yarn link` on.

Go ahead and commit the change that adds those entries.  They're
harmless to have even when `yarn link` isn't in effect, and it's
convenient for them to already be there the next time someone uses it
for the same package.
