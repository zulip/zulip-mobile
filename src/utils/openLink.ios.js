/* @flow */
import { Linking } from 'react-native';

export default (url: string) => Linking.openURL(url);
