# Developing on Windows

This is a guide on doing Zulip Mobile development on a Windows machine.

It's highly recommended that you install [WSL][wsl-home] / "Ubuntu for
Windows", and use `bash` instead of `cmd.exe` for your main shell prompt.
WSL is a [pretty magical][wsl-announce-ubuntu] piece of engineering, and it
gives you access to the same ecosystem of command-line tools that people on
Linux and macOS have been contributing to for decades -- while integrating
closely with the rest of your Windows environment.

[wsl-home]: https://docs.microsoft.com/en-us/windows/wsl/about
[wsl-announce-ubuntu]: https://blog.ubuntu.com/2016/03/30/ubuntu-on-windows-the-ubuntu-userspace-for-windows-developers

## WSL / Ubuntu for Windows
Small guide on how to use the terminal using WSL (Windows Subsystem for
Linux) with the Windows file system, and using it to perform any commands
while running a React Native app in the Android emulator on Windows.

These instructions are **in beta** -- they haven't been tested by as
wide a range of contributors as most of our developer documentation.
If you're trying them, we would love to hear from you [in #mobile on
chat.zulip.org][czo]!

[czo]: ../../README.md#discussion

### What is WSL, and why use it?
WSL is a feature in recent versions of Windows that allows it to run
programs written and built for Linux -- with no change to the programs.
The exact same binary program that runs on a Linux machine, runs on WSL.

This enables you to use a `bash` shell and Unix command-line environment,
while not having to dual-boot your system or suffer the performance loss
caused by running Linux in a virtual machine.

Microsoft's [FAQ for WSL][wsl-faq] is short and clear, and recommended
reading.

[wsl-faq]: https://docs.microsoft.com/en-us/windows/wsl/faq

### Install WSL
WSL requires Windows 10.  (If you're on Windows 8.1 or older, an alternative
approach to get some of the same benefits is [Cygwin](http://www.cygwin.com/).
If you try it out with Zulip Mobile, a PR to add a section to this guide
would be welcome!)

To install: open the Windows Store, and install your preferred distribution
of Linux from there.  (This requires Windows build 1607 or later; 1607 was
released in mid-2016).  I used Ubuntu for this guide.

### The plan
The [recommended approach][so-guide] is to use the Linux side of things for
command-line tasks in your workflow as the developer, including:
* the shell itself (`bash`)
* common command-line utilities (`less`, `grep`)
* `yarn`

You'll want to use the Windows side of things for:
* [VS Code](editor.md) (or your favorite other [editor/IDE](editor.md))
* Android Studio
* the Android emulator
* the location of your development tree in the filesystem

We're not sure yet which side you'll want to use for the following;
try them on both the Linux side and the Windows side, and let us know
which you prefer:
* the `git` command line (from your `bash` shell either way, but you
  might have it run the Windows version)
* Gradle, which is the Java program that does the Android build
  (again, invoking it from your `bash` shell either way)
* the JDK, which is used for running Gradle

What are the reasons to put a given piece on the Linux side or the
Windows side?  (See the [WSL FAQ][wsl-faq] for more information on
many of these.)
* The Linux command-line ecosystem (with `bash` and tools like `grep`)
  is far richer and more convenient than `cmd.exe`; that's the major
  motivation for WSL itself.
* WSL doesn't support GUI programs like VS Code, Android Studio, or
  the Android emulator.  So those run on the Windows side.
* Linux programs running on WSL can read and write files that live in
  the Windows filesystem, but not vice versa.  So putting your files
  in the Windows filesystem makes them convenient to access from both
  sides.
* Many command-line tools (including `git` and `yarn`) support running
  on either Linux or Windows.  For each such tool, you can install it
  on either side (and still invoke it from your `bash` inside WSL),
  but it may be a bit simpler to use the Linux version.
* One significant limitation of WSL (as of 2018) is that doing a large
  amount of filesystem I/O tends to be slow.  This is a reason to do
  operations like a Gradle build, perhaps `git` commands, and perhaps
  the occasional `yarn install` using the Windows versions.

[so-guide]: https://stackoverflow.com/questions/42614347/running-react-native-in-wsl-with-the-emulator-running-directly-in-windows

### Accessing the filesystem
You can access your Windows local drives from `bash` and other Linux
programs by navigating to `/mnt/<drive-letter>` .

### Running `yarn` commands
First, install Node.js and Yarn in your Linux environment.  You'll follow
the same steps as in [our main setup guide](build-run.md) -- just use the
Linux versions. :-)

Similarly, when the React Native install instructions say to install the
`react-native` CLI with `npm install -g react-native-cli`, run that command
in the Linux environment.

Now `yarn` and `react-native` should be available at your `bash` prompt.

### Modify PATH variable
Run the following commands so Linux programs check for `yarn`, etc., in
`/usr/bin` before they check `C\Program Files` and try to run the Windows
installation (which, of course, does not work in Linux).

```
export PATH="$HOME/bin:$HOME/.local/bin:/usr/bin:$PATH"
source ~/.profile
```

### Run emulator
Run your app in the emulator using `react-native run-android`.  Now you can
perform any terminal commands inside the Linux environment, including
`react-native start`, and the emulator will load the bundle correctly.

### Bonus: change your default home directory
It can be useful to have WSL programs use the folder which contains your
coding projects as its home path, `~`.

If you want to try this, modify your `.bashrc` file (located in the default
home directory) to add this line:
```
export HOME=/mnt/<drive-letter>/path/to/your/folder
```
