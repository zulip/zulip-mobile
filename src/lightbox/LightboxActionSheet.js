/* @flow strict-local */
import type { Auth } from '../types';
import { downloadImage } from './download';
import share from './share';
import shareImage from './shareImage';
import { showToast } from '../utils/info';
import * as api from '../api';
import { openLinkEmbedded } from '../utils/openLink';

type DownloadImageType = {|
  src: URL,
  auth: Auth,
|};

type ShareLinkType = {|
  src: URL,
  auth: Auth,
|};

type ExecuteActionSheetActionType = {|
  title: string,
  src: URL,
  auth: Auth,
|};

type ButtonProps = {|
  auth: Auth,
  src: URL,
|};

type ButtonType = {|
  title: string,
  onPress: (props: ButtonProps) => void | Promise<void>,
|};

/**
 * Download directly if possible, else open browser for the user to download there.
 */
const tryToDownloadImage = async ({ src, auth }: DownloadImageType) => {
  const tempUrl = await api.tryGetFileTemporaryUrl(src, auth);
  if (tempUrl === null) {
    openLinkEmbedded(src.toString());
    return;
  }

  const fileName = src.pathname.split('/').pop();
  try {
    await downloadImage(tempUrl.toString(), fileName, auth);
    showToast('Download complete');
  } catch (error) {
    showToast(error.message);
  }
};

const shareLink = ({ src, auth }: ShareLinkType) => {
  share(src.toString());
};

const shareImageDirectly = ({ src, auth }: DownloadImageType) => {
  shareImage(src, auth);
};

const actionSheetButtons: $ReadOnlyArray<ButtonType> = [
  { title: 'Download image', onPress: tryToDownloadImage },
  { title: 'Share image', onPress: shareImageDirectly },
  { title: 'Share link to image', onPress: shareLink },
  { title: 'Cancel', onPress: () => {} },
];

// TODO(i18n): Wire the titles up for translation.
export const constructActionSheetButtons = (): string[] =>
  actionSheetButtons.map(button => button.title);

// TODO: Wire toasts, etc., up for translation.
export const executeActionSheetAction = ({ title, ...props }: ExecuteActionSheetActionType) => {
  const button = actionSheetButtons.find(x => x.title === title);
  if (button) {
    button.onPress(props);
  }
};
