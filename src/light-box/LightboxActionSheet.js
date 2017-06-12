/* @flow */
import { Auth } from '../types';

import download from '../api/downloadFile';
import share from './share';

type downloadProps = {
  url: string,
  auth: Auth,
};

type shareProps = {
  url: string,
};

const downloadImage = ({ url, auth }: downloadProps) => {
  download(url, auth);
};

const shareLink = ({ url }: shareProps) => {
  share(url);
};

const actionSheetButtons = [
  { title: 'Download file', onPress: downloadImage },
  { title: 'Share', onPress: shareLink },
  { title: 'Cancel', onPress: () => false },
];

export const constructActionSheetButtons = () => actionSheetButtons.map(button => button.title);

export const executeActionSheetAction = ({ title, ...props }) => {
  actionSheetButtons.find(button => button.title === title).onPress(props);
};
