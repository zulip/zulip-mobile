/* @flow */
import download from './downloadImage';
import type { Account } from '../types';
import ShareImageAndroid from '../nativeModules/ShareImageAndroid';

export default async (url: string, account: Account) => {
  await download(url, account).then(res => ShareImageAndroid.shareImage(res.path()));
};
