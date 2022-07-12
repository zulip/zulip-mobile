/* @flow strict-local */
import { Alert } from 'react-native';
import Toast from 'react-native-simple-toast';

import type { GlobalSettingsState } from '../types';
import { openLinkWithUserPreference } from './openLink';

export const showToast = (message: string) => {
  Toast.show(message);
};

type LearnMoreButton = {|
  url: URL,
  text?: string,

  // Needed by openLinkWithUserPreference
  globalSettings: GlobalSettingsState,
|};

const makeLearnMoreButton = learnMoreButton => {
  const { url, text, globalSettings } = learnMoreButton;
  return {
    // TODO: Translate default text
    text: text ?? 'Learn more',
    onPress: () => {
      openLinkWithUserPreference(url.toString(), globalSettings);
    },
  };
};

export const showErrorAlert = (
  title: string,
  message?: string,
  learnMoreButton?: LearnMoreButton,
): void => {
  const buttons = [];
  if (learnMoreButton) {
    buttons.push(makeLearnMoreButton(learnMoreButton));
  }
  buttons.push({
    // TODO: translate
    text: 'OK',

    onPress: () => {},
  });

  Alert.alert(title, message, buttons, { cancelable: true });
};
