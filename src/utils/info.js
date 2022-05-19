/* @flow strict-local */
import invariant from 'invariant';
import { Alert } from 'react-native';
import Toast from 'react-native-simple-toast';

import type { GlobalSettingsState } from '../types';
import { openLinkWithUserPreference } from './openLink';

export const showToast = (message: string) => {
  Toast.show(message);
};

export const showErrorAlert = (
  title: string,
  message?: string,
  learnMoreURL?: URL,

  // Required if learnMoreURL passed (used to open the link)
  globalSettings?: GlobalSettingsState,
): void => {
  // TODO: Translate button text

  const buttons = [];
  if (learnMoreURL) {
    invariant(globalSettings !== undefined, 'learnMoreURL is passed; globalSettings should be too');
    buttons.push({
      text: 'Learn more',
      onPress: () => {
        openLinkWithUserPreference(learnMoreURL.toString(), globalSettings);
      },
    });
  }
  buttons.push({ text: 'OK', onPress: () => {} });

  Alert.alert(title, message, buttons, { cancelable: true });
};
