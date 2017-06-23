/* @flow */
import { Auth } from '../types';

import download from '../api/downloadFile';
import share from './share';
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

const downloadImage = ({ url, auth }: DownloadImageType) => {
  download(url, auth).then(() => Toast.show('Download complete.'));
};

const shareLink = ({ url }: ShareLinkType) => {
  share(url);
};

const actionSheetButtons = [
  { title: 'Download file', onPress: downloadImage },
  { title: 'Share', onPress: shareLink },
  { title: 'Cancel', onPress: () => false },
];

export const constructActionSheetButtons = () => actionSheetButtons.map(button => button.title);

export const executeActionSheetAction = ({ title, ...props }: ExecuteActionSheetActionType) => {
  const button = actionSheetButtons.find(x => x.title === title);
  if (button) {
    button.onPress(props);
  }
};
