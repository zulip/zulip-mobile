/* @flow strict-local */
import type { Auth } from '../types';
import share from './share';

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

const shareLink = ({ src, auth }: ShareLinkType) => {
  share(new URL(src, auth.realm).toString());
};

const actionSheetButtons: ButtonType[] = [
  { title: 'Share link to video', onPress: shareLink },
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
