# Managing translations

A person using the Zulip app can choose from a large number of
languages for the app to present its UI in.

Within the running app, we use a library `react-intl` to get the
appropriate translation for a given string ("message") used in the UI.

To manage the set of UI messages and translations for them, and
provide a nice workflow for people to contribute translations, we use
(along with the rest of the Zulip project) a service called Transifex.


## Translators

If you use a language other than English, we would be glad to have
your help in translating Zulip!  See [Zulip's docs on
translating][rtd-translating] for how to join us on Transifex and
contribute.

[rtd-translating]: https://zulip.readthedocs.io/en/latest/translating/translating.html


## All code contributors: wiring our code for translations

All text that appears in our UI should be translated.  This takes a
few different forms in different contexts in our code:

* When the text is passed to one of our own components as a prop, look
  at the type of the prop.  If it's `LocalizableText` (which is a
  supertype of `string`), then the component will take responsibility
  for translating it before display.  Most of our components do this,
  notably `Label` and `ZulipButton`.

  * Conversely, if adding a new component which accepts as a prop some
    text to show in the UI, generally the component should take the
    prop as type `LocalizableText` and take responsibility for
    translating it -- either by passing to another such component, or
    with one of the other forms below.

* Otherwise, use the `_` function: `_('Hello, world')` will return
  `'Hello, world'` if the user's chosen language is English, `'Hola,
  mundo'` if the user's chosen language is Spanish (well, it would if
  we had that string in our translation database -- see below), and so
  on.  This function has type `GetText`, and can be acquired from the
  React context; see jsdoc on `GetText` for details.

* If the message is not constant but requires interpolating some data,
  then:
  * If using `_`, use the following form: `_('Hello, {name}', { name })`.
    Translators will translate the constant string `'Hello, {name}'`,
    including the placeholder.
  * If passing to something that accepts `LocalizableText`, then use
    the same placeholder syntax in the message string, and see the
    `LocalizableText` type definition for where to put the message
    string and the data values.
  * For the full syntax available in message strings, see upstream
    docs from [React Intl][react-intl-formatmessage],
    [Format.JS][formatjs-message-syntax], and
    [ICU][icu-format-messages].

* In all of the above cases, if you're adding a new message string or
  editing an existing one, we'll want to get it into our translation
  database so that translators can translate it.  To do this:

  * In the same commit that adds or edits the message, update the file
    `static/translations/messages_en.json` accordingly.  This is the
    version-controlled source record of what message strings we need
    translations for.

  * When your changes are merged, a maintainer will run the steps
    below to sync those changes up to Transifex.  This makes it
    available for translators to translate there.

  * From time to time, and in particular just before preparing a
    release, a maintainer will run the steps below to sync
    translations from Transifex back down into the other files
    `static/translations/messages_*.json` in our tree.  This is the
    copy of our translation database that gets built into the app and
    used for finding translations.

Important general background on providing strings for translation:

* Never try to concatenate translated strings together, or do other
  string manipulation on them.  Instead, all punctuation, sentence
  structure, etc., should appear inside the constant message string.
  To interpolate data that can vary, use the placeholder syntax
  `'Hello, {name}'`.

  This is important because different languages will put things in
  different orders in a sentence, and use different punctuation and
  spacing.

  For further discussion, see [general Zulip docs on
  internationalization][rtd-i18n].

[react-intl-formatmessage]: https://formatjs.io/docs/react-intl/api/#formatmessage
[formatjs-message-syntax]: https://formatjs.io/docs/core-concepts/icu-syntax/
[icu-format-messages]: http://userguide.icu-project.org/formatparse/messages
[rtd-i18n]: https://zulip.readthedocs.io/en/latest/translating/internationalization.html


## Maintainers: syncing to/from Transifex

This section describes steps done by the maintainers of the Zulip
mobile app, i.e. people who merge PRs into it.  For everyone else, see
the sections above.


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


### Regular operation

To sync with Transifex, run `tools/tx-sync`.

This syncs in both directions, and makes local commits with any
changes.  Review the results and then push to the central repo.

The sync uploads from `static/translations/messages_en.json` to the
set of strings Transifex shows for contributors to translate, and
downloads translations to files `static/translations/messages_*.json`.
(See `.tx/config` for how those paths are configured.)

For more details, see the usage message: `tools/tx-sync --help`.

Then look at the following sections to see if further updates are
needed to take full advantage of the new or updated translations.


### Updating the languages supported in the code

Sometimes when downloading translated strings we get a file for a new
language.  This happens when we've opened up a new language for people
to contribute translations into in the Zulip project on Transifex,
which we do when someone expresses interest in contributing them.

Each messages file in `static/translations/` should be reflected in
two boring, more-or-less mechanical lists:
 * `flow-typed/translations.js`
 * `src/i18n/messages.js`

The first of these has a comment with a trivial command to help
automate updating it.  The other is smaller, and is maintained
manually.  It'd be good to fully automate both of these; we haven't
yet.

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
