/* @flow */
import download from '../api/downloadFile';
import type { Auth } from '../types';
import ShareImageAndroid from '../nativeModules/ShareImageAndroid';

export default (url: string, auth: Auth) => {
  download(url, auth, res => ShareImageAndroid.shareImage(res));
};
