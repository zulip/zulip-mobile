/* @flow */
import type { Auth } from '../types';
import downloadFile from '../api/downloadFile';
import share from './share';
import shareImage from './shareImage';
import { showToast } from '../utils/info';
import { getFullUrl } from '../utils/url';

type DownloadImageType = {
  src: string,
  auth: Auth,
};

type ShareLinkType = {
  src: string,
  auth: Auth,
};

type ExecuteActionSheetActionType = {
  title: string,
  src: string,
  auth: Auth,
};

type ButtonProps = {
  auth: Auth,
  src: string,
};

type ButtonType = {
  title: string,
  onPress: (props: ButtonProps) => void | boolean | Promise<any>,
};

const downloadImage = async ({ src, auth }: DownloadImageType) => {
  try {
    await downloadFile(src, auth);
    showToast('Download complete');
  } catch (error) {
    showToast('Can not download');
  }
};

const shareLink = ({ src, auth }: ShareLinkType) => {
  share(getFullUrl(src, auth.realm));
};

const shareImageDirectly = ({ src, auth }: DownloadImageType) => {
  shareImage(src, auth);
};

const actionSheetButtons: ButtonType[] = [
  { title: 'Download file', onPress: downloadImage },
  { title: 'Share image', onPress: shareImageDirectly },
  { title: 'Share link to image', onPress: shareLink },
  { title: 'Cancel', onPress: () => false },
];

export const constructActionSheetButtons = (): string[] =>
  actionSheetButtons.map(button => button.title);

export const executeActionSheetAction = ({ title, ...props }: ExecuteActionSheetActionType) => {
  const button = actionSheetButtons.find(x => x.title === title);
  if (button) {
    button.onPress(props);
  }
};
