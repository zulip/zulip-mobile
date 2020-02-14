# Managing translations

A person using the Zulip app can choose from a large number of
languages for the app to present its UI in.

Within the running app, we use a library `react-intl` to get the
appropriate translation for a given string ("message") used in the UI.

To manage the set of UI messages and translations for them, and
provide a nice workflow for people to contribute translations, we use
(along with the rest of the Zulip project) a service called Transifex.


## Maintainers: syncing to/from Transifex

### Setup

You'll want Transifex's CLI client, `tx`.

* Install in your homedir with `pip3 install --user transifex-client`.  Or
  you can use your Zulip dev server virtualenv, which has it.

* Configure a `.transifexrc` with your API token.  See [upstream
  instructions](https://docs.transifex.com/client/client-configuration#transifexrc).

  This can go either in your homedir, or in your working tree to make
  the configuration apply only locally; it's already ignored in our
  `.gitignore`.

* You'll need to be added [as a "maintainer"][tx-zulip-maintainers] to
  the Zulip project on Transifex.  (Upstream [recommends
  this][tx-docs-maintainers] as the set of permissions on a Transifex
  project needed for interacting with it as a developer.)

[tx-zulip-maintainers]: https://www.transifex.com/zulip/zulip/settings/maintainers/
[tx-docs-maintainers]: https://docs.transifex.com/teams/understanding-user-roles#project-maintainers


### Uploading strings to translate

Run `tx push -s`.

This uploads from `static/translations/messages_en.json` to the
set of strings Transifex shows for contributors to translate.
(See `.tx/config` for how that's configured.)


### Downloading translated strings

Run `tools/tx-pull`.

This writes to files `static/translations/messages_*.json`.
(See `.tx/config` for how that's configured.)

Then look at the following sections to see if further updates are
needed to take full advantage of the new or updated translations.


### Updating the languages supported in the code

Sometimes when downloading translated strings we get a file for a new
language.  This happens when we've opened up a new language for people
to contribute translations into in the Zulip project on Transifex,
which we do when someone expresses interest in contributing them.

Each messages file in `static/translations/` should be reflected in
three boring, more-or-less mechanical lists:
 * `flow-typed/translations.js`
 * `src/i18n/locale.js`
 * `src/i18n/messages.js`

The first of these has a comment with a trivial command to help
automate updating it.  The others are smaller, and are maintained
manually.  It'd be good to fully automate all of them; we haven't yet.

So, when a new messages file appears, update those three lists.
Then see if the next section applies too...


### Updating the languages offered in the UI

A fourth list should reflect many but not all of the messages files in
`static/translations/`: only the ones with a significant number of
strings actually translated.  This is `src/settings/languages.js`,
which controls the languages offered in the language-picker screen in
our settings UI.

This would also be nice to automate, though a bit more complex, and to
date we haven't.

So, when a language has gone from mostly untranslated, or completely
absent, to significantly translated, update the list in
`src/settings/languages.js` to include it.  See there for details on
what counts as "significantly translated", and for an easy way to
check.
