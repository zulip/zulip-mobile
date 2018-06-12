/* @flow */
import { GetStateItemAndSetState } from '../../types';
import { replaceBetween } from './utils';

export default ({ getState, item, setState }: GetStateItemAndSetState) => {
  let { message } = getState();
  const { selection } = getState();
  message = message || '';
  let newMessage;
  let newSelection;
  if (selection.start !== selection.end) {
    newMessage = replaceBetween(
      message,
      selection,
      `${item.prefix} ${message.substring(selection.start, selection.end)}\n`,
    );
    newSelection = { start: selection.end + 3, end: selection.end + 3 };
  } else if (
    selection.start === selection.end &&
    message.substring(selection.end - 1, selection.end) === '\n'
  ) {
    newMessage = replaceBetween(message, selection, `${item.prefix} `);
    newSelection = { start: selection.start + 2, end: selection.start + 2 };
  } else {
    newMessage = replaceBetween(message, selection, `\n${item.prefix} `);
    newSelection = { start: selection.start + 3, end: selection.start + 3 };
  }

  setState({ message: newMessage }, () => {
    setTimeout(() => {
      setState({ selection: newSelection });
    }, 300);
  });
};
