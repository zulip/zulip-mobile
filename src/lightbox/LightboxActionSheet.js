/* @flow strict-local */
import type { Auth, GetText } from '../types';
import downloadImage from './downloadImage';
import share from './share';
import shareImage from './shareImage';
import { showToast } from '../utils/info';
import { getFullUrl } from '../utils/url';

type DownloadImageType = {|
  src: string,
  auth: Auth,
  _: GetText,
|};

type ShareLinkType = {|
  src: string,
  auth: Auth,
  _: GetText,
|};

type ExecuteActionSheetActionType = {|
  title: string,
  src: string,
  auth: Auth,
  _: GetText,
|};

type ButtonProps = {|
  auth: Auth,
  src: string,
  _: GetText,
|};

type ShareImageType = {|
  auth: Auth,
  src: string,
  _: GetText,
|};

type ButtonType = {|
  title: string,
  onPress: (props: ButtonProps) => void | Promise<void>,
|};

const tryToDownloadImage = async ({ src, auth, _ }: DownloadImageType) => {
  try {
    await downloadImage(src, auth);
    showToast(_('Download complete'));
  } catch (error) {
    showToast(error.message);
  }
};

const shareLink = ({ src, auth, _ }: ShareLinkType) => {
  share(getFullUrl(src, auth.realm), _);
};

const shareImageDirectly = ({ src, auth, _ }: ShareImageType) => {
  shareImage(src, auth, _);
};

const actionSheetButtons: ButtonType[] = [
  { title: 'Download image', onPress: tryToDownloadImage },
  { title: 'Share image', onPress: shareImageDirectly },
  { title: 'Share link to image', onPress: shareLink },
  { title: 'Cancel', onPress: () => {} },
];

export const constructActionSheetButtons = (_: GetText): string[] =>
  actionSheetButtons.map(button => _(button.title));

export const executeActionSheetAction = ({ title, _, ...props }: ExecuteActionSheetActionType) => {
  const button = actionSheetButtons.find(x => _(x.title) === title);
  if (button) {
    button.onPress({ ...props, _ });
  }
};
