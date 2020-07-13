# Developing on Windows using WSL

This is a guide on doing Zulip Mobile development on a Windows machine
using WSL.

**Using WSL is *not* a requirement for working on Zulip Mobile.** If you follow
our step-by-step [main install instructions](build-run.md) on Windows, they
should work just fine. (You'll use a mix of Git Bash and the basic Windows
Command Prompt (aka `cmd.exe`) for your command line.)

However, if you'll be spending a lot of time developing Zulip Mobile, or if
you're already very familiar with the command line on Linux or macOS, it's
highly recommended that you install [WSL][wsl-home] / "Ubuntu for Windows",
and use `bash` instead of `cmd.exe` for your main shell prompt.

WSL is a [pretty magical][wsl-announce-ubuntu] piece of engineering, and it
gives you access to the same ecosystem of command-line tools that people on
Linux and macOS have been contributing to for decades -- while integrating
closely with the rest of your Windows environment.

[wsl-home]: https://docs.microsoft.com/en-us/windows/wsl/about
[wsl-announce-ubuntu]: https://blog.ubuntu.com/2016/03/30/ubuntu-on-windows-the-ubuntu-userspace-for-windows-developers


### What is WSL, and why use it?
WSL is a feature in recent versions of Windows that allows it to run
programs written and built for Linux -- with no change to the programs.
The exact same binary program that runs on a Linux machine, runs on WSL.

This enables you to use a `bash` shell and Unix command-line environment,
while not having to dual-boot your system or suffer the performance loss
caused by running Linux in a virtual machine.

Microsoft's [FAQ for WSL][wsl-faq] is short and clear, and recommended
reading.

WSL requires Windows 10.  (If you're on Windows 8.1 or older, an alternative
approach to get some of the same benefits is [Cygwin](http://www.cygwin.com/).
If you try it out with Zulip Mobile, a PR to add a section to this guide
would be welcome!)

[wsl-faq]: https://docs.microsoft.com/en-us/windows/wsl/faq


## WSL / Ubuntu for Windows
These instructions are **in beta** -- they haven't been tested by as
wide a range of contributors as most of our developer documentation.
If you're trying them, we would love to hear from you [in #mobile on
chat.zulip.org][czo]!

Again, if you aren't already comfortable with the Linux (or macOS)
command line, or just want to get things working quickly and
straightforwardly, you may prefer to skip these beta instructions and
instead follow our step-by-step [main install instructions](build-run.md)
natively on Windows.

[czo]: ../../README.md#discussion


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
  operations like builds of the app (i.e. running Gradle), perhaps
  `git` commands, and perhaps the occasional `yarn install` using the
  Windows versions.

[so-guide]: https://stackoverflow.com/questions/42614347/running-react-native-in-wsl-with-the-emulator-running-directly-in-windows


### Step-by-step instructions for setting up WSL

These are primarily one Zulip contributor's notes from setting up
their dev environment on WSL.  Again, if you're trying them, please
come and say hello [in #mobile on chat.zulip.org][czo]!

0. Update Windows to the latest version.  To use WSL you'll need at least
   the Windows 10 Fall Creators Update, released in late 2017.  (For
   options on Windows 8 and older, see above.)

1. Open Powershell as an Administrator and run the command below to enable WSL.

    `Enable-WindowsOptionalFeature -Online -FeatureName Microsoft-Windows-Subsystem-Linux`

2. Install [Chocolatey][chocolatey]. After installing Chocolatey, use
   it to install the Java SE Development Kit with, at a Windows
   command prompt:

   `choco install -y jdk8`

   (Or possibly now JDK 11, which is the LTS release after JDK 8.  See
   our [main install instructions](build-run.md) for more on JDK
   versions; and [let us know][czo] if you use one version or the
   other and it works for you.)

3. Install and set up Android Studio.

   React Native provides [instructions][rn-setup] for this. You'll need
   to click the tab labeled **React Native CLI Quickstart**, and select the
   **Windows** and **Android** options when they become available (if they're
   not already selected).

   For now, just follow the four steps under **Android development
   environment**; we'll be installing (most of) the other requirements in other
   ways. (You may still want to leave the tab open, though, as this document
   will be referenced later.)

   You can optionally use Chocolatey in step 1, in place of manually downloading
   and executing an installer.  To do so, run at a Windows command prompt:

   `choco install -y AndroidStudio`

   In step "1. Install Android Studio", follow the instructions for
   when you are "already using Hyper-V".  WSL 2 uses Hyper-V.  This
   means that instead of using "HAXM" for the Android emulator, you'll
   have it use the newer "WHPX".

5. Go to the Windows Store and type the name of the Linux distro you
   would like to use with WSL. These instructions have been tested to
   work on Ubuntu and Debian GNU/Linux. When the page for your selected
   distro opens, click on 'Get' to install it.

6. You will receive a notification when the installation has
   completed.  Click on 'Launch' to open it. When it opens, you will
   see the message "Installing, this may take a few minutes...". Soon
   after that, you will be prompted to enter the username and password
   you wish to use.

   If you haven't used a Unix-based system, you will notice that nothing shows
   up while you are typing your password. This is normal and expected behavior.

7. After setting up your username and password, run at the WSL Bash prompt:

    `sudo apt update && sudo apt -y upgrade`

    This will initialize your WSL installation and update your
    distro. This could take a while, so grab a cup of coffee. (You can
    paste this, and the rest of the commands in this guide, into the WSL
    window using your right-click button. Ctrl + V will not work.)

8. Install Node and Yarn on your Linux distribution.  See our [main
   install instructions](build-run.md) for the current recommended
   versions, with links to upstream install instructions.

   (Note that installation via `snap` is not currently an option, as
   `snapd` is not available under WSL.)

10. Install the React Native CLI inside WSL:

    `sudo npm install -g react-native-cli`

11. At the WSL Bash prompt, navigate with `cd` to the folder where you
    would like to put your `zulip-mobile` development tree.

    This folder must be in the Windows filesystem, not the Linux
    filesystem inside WSL; see discussion [above](#the-plan).  From
    WSL, you can find your Windows local drives at paths under
    `/mnt/`: for example, `cd /mnt/c/` to navigate to the `C:\` drive.

12. Clone the project into the chosen directory using (at the WSL
    prompt) the command:

    `git clone https://github.com/zulip/zulip-mobile`

    This will create the `zulip-mobile` subdirectory.

13. Inside WSL, navigate into `zulip-mobile` and run `yarn install`.

    ```
    cd zulip-mobile
    yarn install
    ```

    #### Troubleshooting Yarn

    If you get an error along the lines of

    ```
    EACCESS: permission denied, scandir '/home/{your_unix_username}/.config/yarn/link'
    ```

    run the lines below and then try `yarn install` again.

    ```
    sudo chown -R $USER:$GROUP ~/.npm
    sudo chown -R $USER:$GROUP ~/.config
    ```

    You might see the message 'There appears to be trouble with your
    network connection. Retrying...'. This is normal. Just wait for it
    to keep retrying. If it fails, simply run `yarn install` again and
    again until it completes.

    Alternatively, you can [install Yarn on
    Windows](https://yarnpkg.com/lang/en/docs/install/#windows-stable), navigate
    into the `zulip-mobile` folder in the Windows Command Prompt, and run `yarn
    install` from the Windows side.

14. Follow the React Native instructions ([here][rn-setup], if you've
    closed the tab) under **Preparing the Android device** to set up the device
    you plan to use, whether virtual or physical.

15. At your WSL prompt, navigate into the `android` directory and run
    the Gradle `installDebug` task using the commands below.

    ```
    cd android
    /mnt/c/Windows/System32/cmd.exe /C gradlew.bat :app:installDebug
    ```

    If it succeeded, the command will terminate with the sentence
    "Installed on 1 device".

    Open your Android device applications menu and look for the Zulip
    app, with the name "Zulip (debug)".

16. Open a Windows `cmd` prompt and run the command below to set up the
    reverse proxy that will allow development if you are using a
    physical device.

    `adb reverse tcp:8081 tcp:8081`

    (There's probably a way to run this same command from the WSL
    `bash` prompt, too.  If you try these instructions out and work
    out how to do that, PRs welcome!  ... Better yet, find a way to
    make it happen automatically, like it does for other platforms.)

17. Back at the WSL prompt, navigate up one level, back into the
    zulip-mobile folder, with `cd ..`.  (Unlike on Windows, the space
    after `cd` is required.)  From here, run

    `react-native start`

    When you see the message `Loading dependency graph, done.`, open
    the Zulip app on your device and the final app setup will occur.
    When it has completed, you will see the Zulip app's initial
    screen.

[chocolatey]: https://chocolatey.org/
[rn-setup]: https://reactnative.dev/docs/environment-setup


### Helpful to Know
Below are some useful tips for using WSL

#### Accessing the filesystem
You can access your Windows local drives from `bash` and other Linux
programs by navigating to `/mnt/<drive-letter>` .

#### Modify PATH variable
You can run the following commands so Linux programs check for `yarn`, etc., in
`/usr/bin` before they check `C\Program Files` and try to run the Windows
installation (which, of course, does not work in Linux).

```
export PATH="$HOME/bin:$HOME/.local/bin:/usr/bin:$PATH"
source ~/.profile
```

#### Updating your Linux distribution

It's generally recommended to update your Linux distro daily or weekly. This is
not, by default, automatic; you can do this by typing

`sudo apt update && sudo apt -y upgrade`

(This will take much less time than it did during initial setup.)

You will usually not need to restart Linux after updates unless a package named
`linux-image-` is installed; even then, a restart can be delayed until you're
ready. After the restart, you'll probably want to type `sudo apt autoremove`, to
clear out any old Linux images.


### Troubleshooting

#### `JAVA_HOME` is set to an invalid directory

If you run into an error that says "JAVA_HOME is set to an invalid
directory", consider using `WSLENV` to share the `JAVA_HOME` environment
variable with your WSL installation.  This only works if you have
Windows 10 Build 17064 or newer.

Open Powershell and run

`setx WSLENV "JAVA_HOME/p"`

You can also chain together several environment variables by
separating them with a colon.  For example:

`set WSLENV "JAVA_HOME/p:ANDROID_HOME/p`

#### Unable to locate `tools.jar`

Your Java SDK installation is missing the required `tools.jar` file.
Follow our instructions in step 2 to reinstall the Java SDK using
Chocolatey.
