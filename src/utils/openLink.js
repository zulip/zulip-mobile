/* @flow strict-local */
import { Linking } from 'react-native';

export default (url: string): void => {
  Linking.openURL(url);
};
