/* @flow */
import { isStringWebLink, replaceBetween } from './utils';
import { writeMessageHereString, writeUrlMessageHere } from './placeholderStrings';
import { GetStateItemAndSetState } from '../../types';

export default ({ getState, item, setState }: GetStateItemAndSetState) => {
  const { selection, message } = getState();
  let newMessage;
  let newSelection;
  const selectedMessage = message.substring(selection.start, selection.end);
  if (selection.start !== selection.end) {
    if (isStringWebLink(selectedMessage)) {
      newMessage = replaceBetween(
        message,
        selection,
        `[${writeMessageHereString}](${selectedMessage})`,
      );
      newSelection = {
        start: selection.start + 1,
        end: selection.start + 1 + writeMessageHereString.length,
      };
    } else {
      newMessage = replaceBetween(
        message,
        selection,
        `[${selectedMessage}](${writeUrlMessageHere})`,
      );
      newSelection = {
        start: selection.end + 3,
        end: selection.end + 3 + writeUrlMessageHere.length,
      };
    }
  } else {
    newMessage = replaceBetween(
      message,
      selection,
      `[${writeMessageHereString}](${writeUrlMessageHere})`,
    );
    newSelection = {
      start: selection.start + 1,
      end: selection.start + 1 + writeMessageHereString.length,
    };
  }
  setState({ message: newMessage }, () => {
    setTimeout(() => {
      setState({ selection: newSelection });
    }, 25);
  });
};
