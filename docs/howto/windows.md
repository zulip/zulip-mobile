# Developing on Windows using WSL

This is a guide on doing Zulip Mobile development on a Windows machine
using WSL.

Using WSL is not a requirement for working on Zulip Mobile. If you
follow our step-by-step [main install instructions](build-run.md) on
Windows, they should work just fine.  You'll use the basic Windows
"Command Prompt", aka `cmd.exe`, for your command line.

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
   it to install the JAVA SE Development Kit with

    `choco install -y jdk8`

3. Follow the [instructions][android-studio] here to install Android Studio.

4. In Step 3 above, you saw how to add the `ANDROID_HOME` environment
   variable. Return to the Environment Variables screen. Scroll down
   in the User variables section where you added `ANDROID_HOME` until
   you find a variable called `Path`.

    * Double-click on it, click New in the window that comes up and
      add the line below:

        `%ANDROID_HOME%\tools;%ANDROID_HOME%\platform-tools;%ANDROID_HOME%\build-tools;`

    * Then move to the System variables section and add the
      `ANDROID_HOME` environment variable you added at the end of Step
      3 to System variables.

    * Finally, scroll down in the System variables section until you
      find `Path`. Double-click on it, click New in the window that
      comes up and then add the lines below in separate lines. Be sure
      to replace `{User}` in the lines below with your Windows account
      username.

        ```
        C:\Users\{User}\AppData\Local\Android\Sdk\platform-tools
        C:\Users\{User}\AppData\Local\Android\Sdk\emulator
        ```

5. Go to the Windows Store and type the name of the linux distro you
   would like to use with WSL. These instructions have been tested to
   work on Ubuntu and Debian GNU/Linux. When the page for your selected
   distro opens, click on 'Get' to install it.

6. You will receive a notification when the installation has
   completed.  Click on 'Launch' to open it. When it opens, you will
   see the message "Installing, this may take a few minutes...". Soon
   after that, you will be prompted to enter the username and password
   you wish to use. If you haven't used a UNIX based system you will
   notice that nothing shows up while you are typing your password.
   This is normal and expected behavior.

7. After setting up your username and password, run

    `sudo apt update && sudo apt -y upgrade`

    This will initialize your WSL installation and update your
    distro. This could take a while so grab a cup of coffee. (You can
    paste this and the rest of the commands in this guide into the WSL
    window using your right-click button. Ctrl + V will not work. )

8. Install Node with the command below :

    ```
    curl -sL https://deb.nodesource.com/setup_11.x | sudo -E bash -
    sudo apt-get install -y nodejs
    ```

9. Install Yarn with the command below:

    ```
    curl -sL https://dl.yarnpkg.com/debian/pubkey.gpg | sudo apt-key add -
    echo "deb https://dl.yarnpkg.com/debian/ stable main" | sudo tee /etc/apt/sources.list.d/yarn.list
    sudo apt-get update && sudo apt-get install yarn
    ```

10. Install React Native CLI
    `sudo npm install -g react-native-cli`

11. Navigate to the Windows directory where you would like to store
    the zulip folder using `cd`.

    You can access your Windows local drives from bash and other Linux
    programs by navigating to `/mnt/<drive-letter>` .  For example:
    `cd /mnt/c`

12. Clone the project into the directory using
    `git clone https://github.com/zulip/zulip-mobile`

13. Navigate into the zulip-mobile directory and run yarn install.

    ```
    cd zulip-mobile
    yarn install
    ```

    If you get the error : `EACCESS: permission denied, scandir '/home/{yourUnixuUsername}/.config/yarn/link'`
    run the lines below and then try `yarn install` again.

    ```
    sudo chown -R $USER:$GROUP ~/.npm
    sudo chown -R $USER:$GROUP ~/.config
    ```

    You might see the message 'There appears to be trouble with your
    network connection. Retrying...'. This is normal. Just wait for it
    to keep retrying. If it fails, simply run `yarn install` again and
    again until it completes.

    Alternatively, you can install Yarn on Windows, and navigate into
    the zulip-mobile folder using Windows cmd and run yarn install
    from the Windows side.

14. Follow the [instructions][react-native-setup-device] here to set up
    the device you plan to use, whether its an emulator or a physical
    device.

15. Navigate into the `/android` directory then run the Gradle
    installDebug script using the commands below.

    ```
    cd android
    /mnt/c/Windows/System32/cmd.exe /C gradlew.bat installDebug
    ```

    If it succeeded, the command will terminate with the sentence
    "Installed on 1 device".

    Open your Android device applications menu and look for the Zulip
    app, with the name "Zulip (debug)".

16. Open a Windows `cmd` prompt and run the command below to set up the
    reverse proxy that will allow development if you are using a
    physical device.

    `adb reverse tcp:8081 tcp:8081`

17. Navigate up one level back into the zulip-mobile folder. From here run

    `react-native start`

    When you see the message "Loading dependency graph, done." Open
    the Zulip app on your device and the final app setup will
    occur. When it has completed, you will see the Zulip login page.

[chocolatey]: https://chocolatey.org/
[android-studio]: https://facebook.github.io/react-native/docs/getting-started.html#android-development-environment
[react-native-setup-device]:https://facebook.github.io/react-native/docs/getting-started.html#preparing-the-android-device


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

#### Bonus: change your default home directory
It can be useful to have WSL programs use the folder which contains your
coding projects as its home path, `~`.

If you want to try this, modify your `.bashrc` file (located in the default
home directory) to add this line:
```
export HOME=/mnt/<drive-letter>/path/to/your/folder
```


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
