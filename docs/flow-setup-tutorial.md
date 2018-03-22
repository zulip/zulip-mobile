# Flow setup Tutotrial

Flow is a static-type checker for Javascript code

## The steps to install Flow correctly from scratch are

####  Installation tip : install flow in the root folder of zulip-mobile

####  package installer used - yarn

## Installing flow steps

1. install babel compiler with command line interface,
	run command <$yarn add --dev babel-cli babel-preset-flow>
2. change the present from "react-native" to "flow"
	{
	"present": ["flow"]
	}
3. Install flow version 0.65 for zulip using <$yarn add --dev flow-bin@0.65>
4. type flow init 
5. Type flow server by typing <$yarn run flow> to check if flow is correctly installed

## Uninstalling flow

### Method 1
1. yarn global list (see if flow-bin is present ,if yes then)
2. run command $yarn global remove flow-bin


### Method 2
1. run command $whereis flow
2. type sudo rm -rf <PATH OF FLOW>

** Note **: Flow uses Node8.x so for ubuntu users type $curl -sL https://deb.nodesource.com/setup_8.x | sudo -E bash -sudo apt-get install -y nodejs 
