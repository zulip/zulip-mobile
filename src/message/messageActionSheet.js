import { Clipboard } from 'react-native';

import { narrowFromMessage } from '../utils/narrow';
import { getSingleMessage } from '../api';

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

export const actionSheetButtons = [
  'Narrow to conversation',
  'Reply',
  'Copy to clipboard',
  'Cancel'
];

export const executeActionSheetAction = ({ buttonIndex, ...props }) => {
  [
    narrowToConversation,
    reply,
    copyToClipboard,
    () => {},
  ][buttonIndex](props);
};
