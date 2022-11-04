/* @flow strict-local */
import type { Auth } from '../types';
import { downloadImage } from './download';
import share from './share';
import shareImage from './shareImage';
import { showToast } from '../utils/info';
import * as api from '../api';
import { openLinkEmbedded } from '../utils/openLink';
import { tryParseUrl } from '../utils/url';

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

/**
 * Download directly if possible, else open browser for the user to download there.
 */
const tryToDownloadImage = async ({ src, auth }: DownloadImageType) => {
  const parsedSrc = tryParseUrl(src, auth.realm);
  const tempUrl = parsedSrc ? await api.tryGetFileTemporaryUrl(parsedSrc, auth) : null;
  if (tempUrl === null) {
    openLinkEmbedded(new URL(src, auth.realm).toString());
    return;
  }

  const fileName = src.split('/').pop();
  try {
    await downloadImage(tempUrl.toString(), fileName, auth);
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
