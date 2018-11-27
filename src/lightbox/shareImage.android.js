/* @flow strict-local */
import download from './downloadImage';
import type { Auth } from '../types';
import ShareImageAndroid from '../nativeModules/ShareImageAndroid';

export default async (url: string, auth: Auth) => {
  await download(url, auth).then(res => ShareImageAndroid.shareImage(res.path()));
};
