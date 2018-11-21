/* @flow */
import download from './downloadImage';
import type { Account } from '../types';
import ShareImageAndroid from '../nativeModules/ShareImageAndroid';

export default async (url: string, auth: Account) => {
  await download(url, auth).then(res => ShareImageAndroid.shareImage(res.path()));
};
