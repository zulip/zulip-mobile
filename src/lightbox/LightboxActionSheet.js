/* @flow */
import type { Auth, TranslateStringType } from '../types';
import downloadFile from '../api/downloadFile';
import share from './share';
import shareImage from './shareImage';
import { showToast } from '../utils/info';
import { getFullUrl } from '../utils/url';

type DownloadImageAndTranslateType = {
  src: string,
  auth: Auth,
  translateString: TranslateStringType,
};

type ShareLinkType = {
  src: string,
  auth: Auth,
};

type ExecuteActionSheetActionType = {
  title: string,
  src: string,
  auth: Auth,
  translateString: TranslateStringType,
};

type ButtonProps = {
  auth: Auth,
  src: string,
  translateString: TranslateStringType,
};

type ButtonType = {
  title: string,
  onPress: (props: ButtonProps) => void | boolean | Promise<any>,
};

const downloadImage = async ({ src, auth, translateString }: DownloadImageAndTranslateType) => {
  try {
    await downloadFile(src, auth);
    showToast(translateString('Download complete'));
  } catch (error) {
    showToast(translateString('Can not download'));
  }
};

const shareLink = ({ src, auth }: ShareLinkType) => {
  share(getFullUrl(src, auth.realm));
};

const shareImageDirectly = ({ src, auth, translateString }: DownloadImageAndTranslateType) => {
  shareImage(src, auth, translateString);
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
