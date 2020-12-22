/* @flow strict-local */
import type { Auth } from '../types';
import downloadImage from './downloadImage';
import share from './share';
import shareImage from './shareImage';
import { showToast } from '../utils/info';
import * as api from '../api';
import openLink from '../utils/openLink';

type DownloadImageType = {|
  src: string,
  auth: Auth,
|};

type ShareLinkType = {|
  src: string,
  auth: Auth,
|};

type ExecuteActionSheetActionType = {|
  title: string,
  src: string,
  auth: Auth,
|};

type ButtonProps = {|
  auth: Auth,
  src: string,
|};

type ButtonType = {|
  title: string,
  onPress: (props: ButtonProps) => void | Promise<void>,
|};

const tryToDownloadImage = async ({ src, auth }: DownloadImageType) => {
  const tempUrl = await api.tryGetFileTemporaryUrl(src, auth);
  if (tempUrl === null) {
    showToast('Please download the image from your browser');
    openLink(new URL(src, auth.realm).toString());
    return;
  }

  const fileName = src.split('/').pop();
  try {
    await downloadImage(tempUrl, fileName, auth);
    showToast('Download complete');
  } catch (error) {
    showToast(error.message);
  }
};

const shareLink = ({ src, auth }: ShareLinkType) => {
  share(new URL(src, auth.realm).toString());
};

const shareImageDirectly = ({ src, auth }: DownloadImageType) => {
  shareImage(src, auth);
};

const actionSheetButtons: ButtonType[] = [
  { title: 'Download image', onPress: tryToDownloadImage },
  { title: 'Share image', onPress: shareImageDirectly },
  { title: 'Share link to image', onPress: shareLink },
  { title: 'Cancel', onPress: () => {} },
];

export const constructActionSheetButtons = (): string[] =>
  actionSheetButtons.map(button => button.title);

export const executeActionSheetAction = ({ title, ...props }: ExecuteActionSheetActionType) => {
  const button = actionSheetButtons.find(x => x.title === title);
  if (button) {
    button.onPress(props);
  }
};
