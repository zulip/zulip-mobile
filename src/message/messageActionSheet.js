import { Clipboard } from 'react-native';
import { narrowFromMessage } from '../utils/narrow';
import { getSingleMessage } from '../api';
import { isTopicMuted } from '../utils/message';
import muteTopicApi from '../api/muteTopic';
import unMuteTopicApi from '../api/unMuteTopic';
import unMuteStreamApi from '../api/unMuteStream';
import muteStreamApi from '../api/muteStream';

const narrowToConversation = ({ message, doNarrow }) => {
  doNarrow(narrowFromMessage(message), message.id);
};

const reply = ({ message, doNarrow }) => {
  doNarrow(narrowFromMessage(message), message.id);
};

const copyToClipboard = async ({ message, auth }) => {
  const rawMessage = await getSingleMessage(auth, message.id);
  Clipboard.setString(rawMessage);
};

const unmuteTopic = ({ auth, message }) => {
  unmuteTopicApi(auth, message.display_recipient, message.subject);
};

const muteTopic = ({ auth, message }) => {
  muteTopicApi(auth, message.display_recipient, message.subject);
};

const unmuteStream = ({ auth, message, subscriptions }) => {
  const sub = subscriptions.find(x => x.name === message.display_recipient);
  unmuteStreamApi(auth, sub.stream_id);
};

const muteStream = ({ auth, message, subscriptions }) => {
  const sub = subscriptions.find(x => x.name === message.display_recipient);
  muteStreamApi(auth, sub.stream_id);
};

const skip = () => false;

const actionSheetButtons = [
  { title: 'Narrow to conversation', onPress: narrowToConversation },
  { title: 'Reply', onPress: reply },
  { title: 'Copy to clipboard', onPress: copyToClipboard },
  // If skip then covered in constructActionButtons
  { title: 'Unmute topic', onPress: unmuteTopic, onlyIf: skip },
  { title: 'Mute topic', onPress: muteTopic, onlyIf: skip },
  { title: 'Mute stream', onPress: muteStream, onlyIf: skip },
  { title: 'Unmute stream', onPress: unmuteStream, onlyIf: skip },
  { title: 'Cancel', onPress: skip, onlyIf: skip },
];

export const constructActionButtons = ({ message, auth, narrow, subscriptions, mute }) => {
  const buttons = actionSheetButtons.filter(x =>
    !x.onlyIf || x.onlyIf({ message, auth, narrow })).map(x => x.title);

  // These are dependent conditions, hence better if we manage here rather than using onlyIf
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

export const executeActionSheetAction = ({ title, ...props }) => {
  actionSheetButtons.find(x => x.title === title).onPress(props);
};
