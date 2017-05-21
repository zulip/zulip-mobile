/* @flow */
import { StatusBar, Platform } from 'react-native';

// Network activity indicators should be visible if *any* network activity is occurring

let activityCounter = 0;

export const networkActivityStart = (isSilent: boolean) => {
  if (isSilent) return;

  activityCounter++;
  if (Platform.OS === 'ios') {
    StatusBar.setNetworkActivityIndicatorVisible(true);
  }
};

export const networkActivityStop = (isSilent: boolean) => {
  if (isSilent) return;

  activityCounter--;
  if (activityCounter === 0 && Platform.OS === 'ios') {
    StatusBar.setNetworkActivityIndicatorVisible(false);
  }
};
