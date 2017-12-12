/* @flow */
import { replaceBetween } from './utils';
import { GetStateItemAndSetState } from '../../types';

export default ({ getState, item, setState }: GetStateItemAndSetState) => {
  const { message, selection } = getState();
  let newMessage = replaceBetween(
    message,
    selection,
    `\n${item.wrapper.concat(
      '\n',
      message.substring(selection.start, selection.end),
      '\n',
      item.wrapper,
      '\n',
    )}`,
  );
  let newPosition;
  if (selection.start === selection.end) {
    newPosition = selection.end + item.wrapper.length + 2; // +2 For two new lines
    newMessage = replaceBetween(
      message,
      selection,
      `\n${item.wrapper.concat(
        '\n',
        message.substring(selection.start, selection.end),
        '\n',
        item.wrapper,
        '\n',
      )}`,
    );
  } else {
    newPosition = selection.end + item.wrapper.length * 2 + 3; // +3 For three new lines
    newMessage = replaceBetween(
      message,
      selection,
      `${item.wrapper.concat(
        '\n',
        message.substring(selection.start, selection.end),
        '\n',
        item.wrapper,
        '\n',
      )}`,
    );
  }
  const extra = {
    selection: {
      start: newPosition,
      end: newPosition,
    },
  };
  setState({ message: newMessage }, () => {
    setTimeout(() => {
      setState({ ...extra });
    }, 25);
  });
};
