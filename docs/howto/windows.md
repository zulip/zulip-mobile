Small guide on how to use the terminal using WSL (Windows Subsystem for Linux) with the windows file system, and using it to perform any commands while running a react native android app in Android emulator on Windows.

### Why use WSL?
WSL is great for Windows users, as they essentially allow the use of Unix terminal while not having to dual boot their system or suffer the performance loss caused by running Linux in a virtual machine.

### Install WSL
Install your preferred distribution of Linux available in the Windows store (You must have Windows build 1607 or later to be able to do this). I used Ubuntu for this guide.

### Accessing the filesystem
You can access your Windows local drives by navigating to `/mnt/<drive-letter>`

### Running npm commands
First install node in your subsystem. For example, to install node 8.x in Ubuntu, run:

```
curl -sL https://deb.nodesource.com/setup_8.x | sudo -E bash -
sudo apt-get install -y nodejs
```

Install `react-native-cli` globally with `sudo npm i -g react-native-cli`.

Zulip recommends using `yarn` over `npm` which comes with node.

Install yarn with `sudo npm i -g yarn`

### Modify PATH variable
Run the following commands so the subsystem checks for npm in `/usr/bin` before it checks `C\Program Files` and tries to run the Windows installation (which of course, does not work in Linux).

`export PATH="$HOME/bin:$HOME/.local/bin:/usr/bin:$PATH"`
`source ~/.profile`

### Run emulator
Run your app in the emulator using react-native run-android.
Now you can perform any terminal commands inside the subsystem, including react-native start and emulator will load the bundle correctly.

### Bonus: change your default home directory
It can be useful to have the WSL use the folder which contains your coding projects as it’s home path: ‘`~`’.

Modify your `.bashrc` file (located in the default home directory) and add `HOME=/mnt/<drive-letter>/path/to/your/folder`
