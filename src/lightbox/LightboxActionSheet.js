/* @flow */
import type { Account } from '../types';
import downloadImage from './downloadImage';
import share from './share';
import shareImage from './shareImage';
import { showToast } from '../utils/info';
import { getFullUrl } from '../utils/url';

type DownloadImageType = {
  src: string,
  account: Account,
};

type ShareLinkType = {
  src: string,
  account: Account,
};

type ExecuteActionSheetActionType = {
  title: string,
  src: string,
  account: Account,
};

type ButtonProps = {
  account: Account,
  src: string,
};

type ButtonType = {
  title: string,
  onPress: (props: ButtonProps) => void | boolean | Promise<any>,
};

const tryToDownloadImage = async ({ src, account }: DownloadImageType) => {
  try {
    await downloadImage(src, account);
    showToast('Download complete');
  } catch (error) {
    showToast(error.message);
  }
};

const shareLink = ({ src, account }: ShareLinkType) => {
  share(getFullUrl(src, account.realm));
};

const shareImageDirectly = ({ src, account }: DownloadImageType) => {
  shareImage(src, account);
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
