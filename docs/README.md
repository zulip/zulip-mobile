# Zulip Mobile developer documentation

This directory contains documentation for contributing to the Zulip
mobile app, for iOS and Android.


## Getting the app

See the [main README](../README.md).


## Contributing

If you're interested in helping out with Zulip, please [install the
beta app](../README.md#using-the-beta) and report bugs :-).

To get started with the code, follow our [Developer
Guide](developer-guide.md).

Then see our [Contribution Guidelines](../CONTRIBUTING.md), and come
say hello in [the #mobile-dev-help stream](../README.md#discussion).

To learn more, take a look through our developer documentation.
See below.


## Documentation overview

The key docs to read up front are the [main README](../README.md), the
[Developer Guide](developer-guide.md), and the [Contribution
Guidelines](../CONTRIBUTING.md).

After you've gotten the development environment running, and said
hello in the #mobile-dev-help stream in chat, some good things to read to learn
more include:

* [Architecture](architecture.md)
* [Glossary](glossary.md)
* [Testing](howto/testing.md)
* [our Git Guide](howto/git.md) (and try out all the example commands)
* [Debugging](howto/debugging.md) (linked from the Developer Guide,
  but worth rereading after you've done a PR or two)
* [Recommended Reading](background/recommended-reading.md)
* [WebView-specific](background/webview.md)
* ... and browse through this whole `docs/` subtree to see what else
  is here. ;-)


## Searching the documentation

To search through the documentation, you can use the search feature
here on GitHub.  Here's an [example search for "redux"][gh-search];
start from there and replace "redux" with whatever you'd like to
search for.

[gh-search]: https://github.com/search?q=repo%3Azulip%2Fzulip-mobile+language%3AMarkdown+redux&type=Code

Alternatively, search the docs inside your own clone of the repo.
Try a command like one of these:
```
$ git grep -C2 -i redux docs/

$ rg -C2 -i redux docs/
```
(For extra search features, see docs: [`git grep`][man-git-grep],
[`rg`][man-rg].)  Or use your favorite alternate search tool, or a
search in your IDE.

[man-git-grep]: https://manpages.debian.org/testing/git-man/git-grep.1.en.html
[man-rg]: https://manpages.debian.org/testing/ripgrep/rg.1.en.html
