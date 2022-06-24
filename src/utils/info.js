/* @flow strict-local */
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

  learnMoreButton?: {|
    url: URL,
    text?: string,

    // Needed by openLinkWithUserPreference
    globalSettings: GlobalSettingsState,
  |},
): void => {
  const buttons = [];
  if (learnMoreButton) {
    const { url, text, globalSettings } = learnMoreButton;
    buttons.push({
      // TODO: Translate default text
      text: text ?? 'Learn more',
      onPress: () => {
        openLinkWithUserPreference(url.toString(), globalSettings);
      },
    });
  }
  buttons.push({ text: 'OK', onPress: () => {} });

  Alert.alert(title, message, buttons, { cancelable: true });
};
