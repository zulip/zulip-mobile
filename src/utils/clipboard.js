/* @flow */
import { Clipboard } from 'react-native';

export const copyToClipboard = (message: string) => Clipboard.setString(message);
