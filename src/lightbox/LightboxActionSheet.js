/* @flow */
import type { Account } from '../types';
import downloadImage from './downloadImage';
import share from './share';
import shareImage from './shareImage';
import { showToast } from '../utils/info';
import { getFullUrl } from '../utils/url';

type DownloadImageType = {
  src: string,
  auth: Account,
};

type ShareLinkType = {
  src: string,
  auth: Account,
};

type ExecuteActionSheetActionType = {
  title: string,
  src: string,
  auth: Account,
};

type ButtonProps = {
  auth: Account,
  src: string,
};

type ButtonType = {
  title: string,
  onPress: (props: ButtonProps) => void | boolean | Promise<any>,
};

const tryToDownloadImage = async ({ src, auth }: DownloadImageType) => {
  try {
    await downloadImage(src, auth);
    showToast('Download complete');
  } catch (error) {
    showToast(error.message);
  }
};

const shareLink = ({ src, auth }: ShareLinkType) => {
  share(getFullUrl(src, auth.realm));
};

const shareImageDirectly = ({ src, auth }: DownloadImageType) => {
  shareImage(src, auth);
};

const actionSheetButtons: ButtonType[] = [
  { title: 'Download image', onPress: tryToDownloadImage },
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
