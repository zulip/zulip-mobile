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

### What is WSL, and why use it?
WSL is a feature in recent versions of Windows that allows it to run
programs written and built for Linux -- with no change to the programs.
The exact same binary program that runs on a Linux machine, runs on WSL.

This enables you to use a `bash` shell and Unix command-line environment,
while not having to dual-boot your system or suffer the performance loss
caused by running Linux in a virtual machine.

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
* the `git` command line
* `yarn`

You'll want to use the Windows side of things for:
* your [editor/IDE](editor.md), e.g. VS Code
* the Android emulator
* perhaps the Java program (Gradle) that does the Android build

[so-guide]: https://stackoverflow.com/questions/42614347/running-react-native-in-wsl-with-the-emulator-running-directly-in-windows

### Accessing the filesystem
You can access your Windows local drives from `bash` and other Linux
programs by navigating to `/mnt/<drive-letter>` .

### Running npm commands
First install `node` in your Linux environment.  For example, to install
Node 8.x in Ubuntu, run:

```
curl -sL https://deb.nodesource.com/setup_8.x | sudo -E bash -
sudo apt-get install -y nodejs
```

Install `react-native-cli` globally with `sudo npm i -g react-native-cli`.

Zulip recommends using `yarn` over `npm` which comes with node.

Install yarn with `sudo npm i -g yarn`

### Modify PATH variable
Run the following commands so Linux programs check for `npm` in `/usr/bin`
before they check `C\Program Files` and try to run the Windows installation
(which, of course, does not work in Linux).

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
