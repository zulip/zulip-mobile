/* @flow strict-local */
import { StatusBar, Platform } from 'react-native';

// Prior to iOS 13, applications were permitted and expected to show a network
// activity indicator in the status bar while performing network actions.
//
// From iOS 13 onward, this is deprecated. Calls to the existing API to show the
// activity indicator no longer have any effect.
//
// As we do support some iOS versions prior to 13, and as Apple has issued no
// injunctions against the use of this particular API, we retain the calls for
// now.
//
// References:
//  * https://developer.apple.com/documentation/uikit/uiapplication/1623102-networkactivityindicatorvisible
//  * https://web.archive.org/web/20200416174728/https://developer.apple.com/design/human-interface-guidelines/ios/controls/progress-indicators/

let activityCounter = 0;

export const networkActivityStart = (isSilent: boolean) => {
  if (isSilent) {
    return;
  }

  activityCounter++;
  if (Platform.OS === 'ios') {
    StatusBar.setNetworkActivityIndicatorVisible(true);
  }
};

export const networkActivityStop = (isSilent: boolean) => {
  if (isSilent) {
    return;
  }

  activityCounter--;
  if (activityCounter === 0 && Platform.OS === 'ios') {
    StatusBar.setNetworkActivityIndicatorVisible(false);
  }
};
