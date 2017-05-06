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

const actionSheetButtons = [
  { title: 'Narrow to conversation', onPress: narrowToConversation },
  { title: 'Reply', onPress: reply },
  { title: 'Copy to clipboard', onPress: copyToClipboard },
  { title: 'Cancel', onPress: () => {} }
];

export const constructActionButtons = (message, auth, narrow) =>
  actionSheetButtons.filter(x => !x.onlyIf || x.onlyIf(message, auth, narrow)).map(x => x.title);

export const executeActionSheetAction = ({ title, ...props }) => {
  actionSheetButtons.find(x => x.title === title).onPress(props);
};
