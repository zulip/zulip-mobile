/* @flow */
import { CameraRoll } from 'react-native';
import type { Auth } from '../types';

export default (url: string, auth?: Auth, onSuccess?: () => void, onError?: () => void) =>
  CameraRoll.saveToCameraRoll(url)
    .then(onSuccess)
    .catch(onError);
