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
  learnMoreUrl?: URL,

  // Required if learnMoreUrl passed (used to open the link)
  globalSettings?: GlobalSettingsState,
): void => {
  // TODO: Translate button text

  const buttons = [];
  if (learnMoreUrl) {
    invariant(globalSettings !== undefined, 'learnMoreUrl is passed; globalSettings should be too');
    buttons.push({
      text: 'Learn more',
      onPress: () => {
        openLinkWithUserPreference(learnMoreUrl.toString(), globalSettings);
      },
    });
  }
  buttons.push({ text: 'OK', onPress: () => {} });

  Alert.alert(title, message, buttons, { cancelable: true });
};
