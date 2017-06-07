/* @flow */
import { Clipboard, Share } from 'react-native';
import { DoNarrowAction, Auth } from '../types';
import { narrowFromMessage } from '../utils/narrow';
import { getSingleMessage } from '../api';
import { isTopicMuted } from '../utils/message';
import muteTopicApi from '../api/muteTopic';
import unmuteTopicApi from '../api/unmuteTopic';
import unmuteStreamApi from '../api/unmuteStream';
import muteStreamApi from '../api/muteStream';
import toggleMessageStarredApi from '../api/toggleMessageStarred';

type MessageAndDoNarrowType = {
  message: Object,
  doNarrow: DoNarrowAction,
};

type AuthAndMessageType = {
  auth: Auth,
  message: Object,
};

type AuthMessageAndSubscriptionsType = {
  auth: Auth,
  message: Object,
  subscriptions: any[],
};

type ButtonProps = {
  auth?: Auth,
  message: Object,
  subscriptions: any[],
  doNarrow?: DoNarrowAction,
};

type ExecuteActionSheetActionType = {
  title: string,
  auth?: Auth,
  message: Object,
  subscriptions: any[],
  doNarrow?: DoNarrowAction,
};

type ConstructActionButtonsType = {
  message: Object,
  auth: Auth,
  narrow: [],
  subscriptions: any[],
  mute: any[],
  flags: Object,
};

const reply = ({ message, doNarrow }: MessageAndDoNarrowType) => {
  doNarrow(narrowFromMessage(message), message.id);
};

const copyToClipboard = async ({ auth, message }: AuthAndMessageType) => {
  const rawMessage = await getSingleMessage(auth, message.id);
  Clipboard.setString(rawMessage);
};

const unmuteTopic = ({ auth, message }: AuthAndMessageType) => {
  unmuteTopicApi(auth, message.display_recipient, message.subject);
};

const muteTopic = ({ auth, message }: AuthAndMessageType) => {
  muteTopicApi(auth, message.display_recipient, message.subject);
};

const unmuteStream = ({ auth, message, subscriptions }: AuthMessageAndSubscriptionsType) => {
  const sub = subscriptions.find(x => x.name === message.display_recipient);
  if (sub) {
    unmuteStreamApi(auth, sub.stream_id);
  }
};

const muteStream = ({ auth, message, subscriptions }: AuthMessageAndSubscriptionsType) => {
  const sub = subscriptions.find(x => x.name === message.display_recipient);
  if (sub) {
    muteStreamApi(auth, sub.stream_id);
  }
};

const starMessage = ({ auth, message }: AuthAndMessageType) => {
  toggleMessageStarredApi(auth, [message.id], true);
};

const unstarMessage = ({ auth, message }: AuthAndMessageType) => {
  toggleMessageStarredApi(auth, [message.id], false);
};

const shareMessage = ({ message }) => {
  Share.share({
    message: message.content.replace(/<(?:.|\n)*?>/gm, '')
  });
};

const skip = () => false;

type ButtonType = {
  title: string,
  onPress: (props: ButtonProps) => void | boolean | Promise<any>,
  onlyIf?: () => boolean,
};

const actionSheetButtons: ButtonType[] = [
  { title: 'Reply', onPress: reply },
  { title: 'Copy to clipboard', onPress: copyToClipboard },
  { title: 'Share', onPress: shareMessage },
  // If skip then covered in constructActionButtons
  { title: 'Star Message', onPress: starMessage, onlyIf: skip },
  { title: 'Unstar Message', onPress: unstarMessage, onlyIf: skip },
  { title: 'Unmute topic', onPress: unmuteTopic, onlyIf: skip },
  { title: 'Mute topic', onPress: muteTopic, onlyIf: skip },
  { title: 'Mute stream', onPress: muteStream, onlyIf: skip },
  { title: 'Unmute stream', onPress: unmuteStream, onlyIf: skip },
  { title: 'Cancel', onPress: skip, onlyIf: skip },
];

export const constructActionButtons = ({
   message,
   auth,
   narrow,
   subscriptions,
   mute,
   flags
}: ConstructActionButtonsType) => {
  const buttons = actionSheetButtons.filter(x =>
    !x.onlyIf || x.onlyIf({ message, auth, narrow })).map(x => x.title);

  // These are dependent conditions, hence better if we manage here rather than using onlyIf
  if (message.id in flags.starred) {
    buttons.push('Unstar Message');
  } else {
    buttons.push('Star Message');
  }
  if (message.type === 'stream') {
    if (isTopicMuted(message, mute)) {
      buttons.push('Unmute topic');
    } else {
      buttons.push('Mute topic');
    }
    const sub = subscriptions.find(x => x.name === message.display_recipient);
    if (sub && !sub.in_home_view) {
      buttons.push('Unmute stream');
    } else {
      buttons.push('Mute stream');
    }
  }
  buttons.push('Cancel');
  return buttons;
};

export const executeActionSheetAction = ({ title, ...props }: ExecuteActionSheetActionType) => {
  const button = actionSheetButtons.find(x => x.title === title);
  if (button) {
    button.onPress(props);
  }
};
