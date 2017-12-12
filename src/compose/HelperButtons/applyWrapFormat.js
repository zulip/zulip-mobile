/* @flow */
import { GetStateItemAndSetState } from '../../types';
import { replaceBetween } from './utils';

export default ({ getState, item, setState }: GetStateItemAndSetState) => {
  const { message, selection } = getState();
  const newMessage = replaceBetween(
    message,
    selection,
    item.wrapper.concat(message.substring(selection.start, selection.end), item.wrapper),
  );
  let newPosition;
  if (selection.start === selection.end) {
    newPosition = selection.end + item.wrapper.length;
  } else {
    newPosition = selection.end + item.wrapper.length * 2;
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
