# Developer guide

We target operating systems >= Android 4.4 (API 19) and >= iOS 8.0.

## Why React Native?

* Support iOS and Android with one codebase
* Familiar web programming model (React + Javascript + Flexbox)
* Cross-platform, 90% code reuse between iOS and Android platforms

## System requirements

* Android: You can build and run with any of Linux, Windows, or macOS.
* iOS: macOS only.  Many contributors use Linux or Windows and
  develop without testing on iOS.  Fortunately, React Native means
  this works fine.

## Setup

To become highly productive in working on Zulip Mobile, you'll want to set
up your development environment in several ways:

1. Building and running the app.  See [our instructions](howto/build-run.md).
2. An editor, or IDE, with good support for navigation and type information.
   This makes a big difference in productivity, and especially so when
   working in a codebase that's new to you.  See [the Editors / IDEs
   section](#editors--ides) below.
3. Debugging.  It's fine to skip this at first to get going, but when you're
   tackling a moderately complex issue, a good debugging setup can help a
   lot.  See [our debugging guide](howto/debugging.md) for details, including
   setup instructions.

## Editors / IDEs

### Visual Studio Code

Visual Studio Code is an open-source IDE which supports our codebase well, with good
support for features like navigating to a definition or showing type
information.

To use it, [install VS Code](https://code.visualstudio.com/).

#### Useful extensions for VS Code

Install these three extensions, which support important aspects of our
codebase. Each extension page has install instructions at the top.

* [React Native
    Tools](https://marketplace.visualstudio.com/items?itemName=vsmobile.vscode-react-native)
* [Flow Language
    Support](https://marketplace.visualstudio.com/items?itemName=flowtype.flow-for-vscode)
* [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)

For the extensions to work properly, make sure that VS Code has recognized
[our settings file](https://github.com/zulip/zulip-mobile/tree/master/.vscode/settings.json)
in the zulip-mobile repository. Usually, this should happen automatically
when you open the `zulip-mobile` folder in VS Code. You can verify that the
settings were recognized by opening your Workspace Settings with
`Ctrl+Shift+P` -> `Open Workspace Settings`. If the editor on the right-hand
side starts with the comment
```js
// Workspace Settings for the zulip-mobile repo.
```
you're all set - VS Code has recognized your workspace settings. If not,
make sure that you opened VS Code as a folder. Do this by pressing
`Ctrl+K Ctrl+O` and navigating to your local `zulip-mobile` clone.

#### Getting familiar with VS Code

Take a look through some of VS Code's docs.  In particular:

* Be sure to look at the [Code
  Navigation](https://code.visualstudio.com/docs/editor/editingevolved)
  doc, and try out Go to Definition (F12), Quick Open (Ctrl+P), and Open
  Symbol by Name (Ctrl+T).  These can make it much faster to move around
  our codebase to read and understand it.
* Get the [keyboard shortcuts PDF
  reference](https://code.visualstudio.com/docs/getstarted/keybindings#_keyboard-shortcuts-reference)
  for your platform, and print it out.  It's a one-page PDF which is
  extremely helpful to refer to.

## Formatting code using prettier

* Using atom editor - install the `prettier-atom` plugin
* Using the command line - run `npm run prettier`
