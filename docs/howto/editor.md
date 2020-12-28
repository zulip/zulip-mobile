# Editors / IDEs

To become highly productive in working on Zulip Mobile, you'll want to set
up an editor, or IDE, with good support for navigation and type information.
This makes a big difference in productivity, and especially so when working
in a codebase that's new to you.

Currently there's one editor we recommend for normal work in our codebase:
Visual Studio Code.


## Visual Studio Code

Visual Studio Code is an open-source IDE which supports our codebase well, with good
support for features like navigating to a definition or showing type
information.

To use it, [install VS Code](https://code.visualstudio.com/).

### Useful extensions for VS Code

VS Code should prompt you to install the recommended extensions when you open the
workspace for the first time. If you don't get the notification you can also review
the list with the `Extensions: Show Recommended Extensions` command (press
`ctrl/cmd + shift + P` to bring up command prompt).

The following are the recommended extensions for reference.

* [React Native
    Tools](https://marketplace.visualstudio.com/items?itemName=msjsdiag.vscode-react-native)
* [Flow Language
    Support](https://marketplace.visualstudio.com/items?itemName=flowtype.flow-for-vscode)
* [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)
* [prettier-vscode](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)

If something doesn't seem right, see the items under "Troubleshooting" below.

Perhaps try the following extensions too, which can be handy:

* [Color Picker](https://marketplace.visualstudio.com/items?itemName=anseki.vscode-color)
* [Color Highlight](https://marketplace.visualstudio.com/items?itemName=naumovs.color-highlight)


### Getting familiar with VS Code

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

* Open any JS file in our codebase, and try messing up some formatting by
  adding random whitespace -- then hit Ctrl+S (or Cmd+S) to save.  You
  should see the formatting get magically fixed!  Our workspace settings
  enable this feature, and configure it to use our standard formatting
  rules.


### Troubleshooting

#### Confirm our workspace settings took effect

For the extensions to work properly, make sure that VS Code has recognized
[our settings file](https://github.com/zulip/zulip-mobile/tree/master/.vscode/settings.json)
in the zulip-mobile repository. Usually, this should happen automatically
when you open the `zulip-mobile` folder in VS Code.

You can verify that the settings were recognized by opening your
Workspace Settings with `Ctrl+Shift+P` -> `Open Workspace
Settings`. If the editor on the right-hand side starts with the
comment
```js
// Workspace Settings for the zulip-mobile repo.
```
you're all set - VS Code has recognized your workspace settings. If not,
make sure that you opened VS Code as a folder. Do this by pressing
`Ctrl+K Ctrl+O` and navigating to your local `zulip-mobile` clone.


#### Saving causes bad reformatting of code

When you save a file after installing the extensions above, the file
should be automatically formatted to stick to our code-formatting
style.

If instead it gets reformatted with lots of changes, for example like this:
```
export {
  default as Foo
}
from './Foo';
```
this might be caused by additional extensions you have installed.

To fix the problem, [view your extensions][vscode-doc-extensions].
On each extension you have enabled that isn't in our list above,
select "Disable (Workspace)" to disable it for your Zulip Mobile
workspace (or "Disable" or "Uninstall", if you no longer want it
in general.)

Once you have things working with purely our standard list of
extensions, you can re-enable other extensions one at a time to
identify which one caused the problem.

[vscode-doc-extensions]: https://code.visualstudio.com/docs/editor/extension-gallery#_manage-extensions


## Android Studio (as needed)

Android Studio is the IDE supported upstream by the Android platform in
general.  Its support for Java and for Android-specific quirks is excellent,
while VS Code's is not very good.  When working in the Android-specific part
of our codebase (`android/`), we therefore recommend using Android Studio.


## Other editors

Using other editors isn't generally recommended.  Here's some miscellaneous
information if you do.

* We format our code using `prettier`.  Run `tools/fmt` to do this
  manually.  (If using Atom, the `prettier-atom` plugin helps.)
