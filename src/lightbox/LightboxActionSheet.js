/* @flow */
import type { Auth } from '../types';
import download from '../api/downloadFile';
import share from './share';
import shareImage from './shareImage';
import { showToast } from '../utils/info';

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
    showToast('Download complete');
  } catch (error) {
    showToast('Can not download');
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
  { title: 'Share image', onPress: shareImageDirectly },
  { title: 'Share link to image', onPress: shareLink },
  { title: 'Cancel', onPress: () => false },
];

export const constructActionSheetButtons = () => actionSheetButtons.map(button => button.title);

export const executeActionSheetAction = ({ title, ...props }: ExecuteActionSheetActionType) => {
  const button = actionSheetButtons.find(x => x.title === title);
  if (button) {
    button.onPress(props);
  }
};
