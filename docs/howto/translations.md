# Managing translations

## Maintainers: syncing to/from Transifex

### Setup

You'll want Transifex's CLI client, `tx`.
* Install in your homedir with `pip3 install --user transifex-client`.  Or
  you can use your Zulip dev server virtualenv, which has it.
* Configure a `.transifexrc` with your API token.  See [upstream
  instructions](https://docs.transifex.com/client/client-configuration#transifexrc).

### Uploading strings to translate

Run `tx push -s`.

### Downloading translated strings

Run `tools/tx-pull`.
