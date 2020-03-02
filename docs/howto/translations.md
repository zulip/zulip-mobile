# Managing translations

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


### Downloading translated strings

Run `tools/tx-pull`.
