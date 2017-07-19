/* @flow */
import { CameraRoll } from 'react-native';
import type { Auth } from '../types';

export default (url: string, auth?: Auth) => CameraRoll.saveToCameraRoll(url);
