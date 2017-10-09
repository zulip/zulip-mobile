/* @flow */
import { Platform } from 'react-native';

import type { Auth } from '../types';
import download from '../api/downloadFile';
import share from './share';
import shareImage from './shareImage';
import Toast from '../utils/showToast';

type DownloadImageType = {
  url: string,
  auth: Auth,
};

type ShareLinkType = {
  url: string,
};

type ExecuteActionSheetActionType = {
  title: string,
  url: string,
  auth: Auth,
};

type ButtonProps = {
  auth?: Auth,
  url: string,
};

type ButtonType = {
  title: string,
  onPress: (props: ButtonProps) => void | boolean | Promise<any>,
};

const downloadImage = async ({ url, auth }: DownloadImageType) => {
  try {
    await download(url, auth);
    Toast('Download complete.');
  } catch (error) {
    Toast("Can't download");
  }
};

const shareLink = ({ url }: ShareLinkType) => {
  share(url);
};

const shareImageDirectly = ({ url, auth }: DownloadImageType) => {
  shareImage(url, auth);
};

const actionSheetButtons: ButtonType[] = [
  { title: 'Download file', onPress: downloadImage },
  { title: 'Share Link', onPress: shareLink },
  { title: 'Share Image', onPress: shareImageDirectly, onlyIf: () => Platform.OS === 'android' },
  { title: 'Cancel', onPress: () => false },
];

export const constructActionSheetButtons = () =>
  actionSheetButtons.filter(x => !x.onlyIf || x.onlyIf()).map(button => button.title);

export const executeActionSheetAction = ({ title, ...props }: ExecuteActionSheetActionType) => {
  const button = actionSheetButtons.find(x => x.title === title);
  if (button) {
    button.onPress(props);
  }
};
