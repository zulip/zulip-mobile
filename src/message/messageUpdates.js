/* @flow */
import isEqual from 'lodash.isequal';

import type { Props } from '../message/MessageListContainer';

type TransitionProps = {
  sameNarrow: boolean,
  noMessages: boolean,
  noNewMessages: boolean,
  onlyOneNewMessage: boolean,
  oldMessagesAdded: boolean,
  newMessagesAdded: boolean,
};

export const getMessageTransitionProps = (prevProps: Props, nextProps: Props): TransitionProps => {
  const sameNarrow = isEqual(prevProps.narrow, nextProps.narrow);
  const noMessages = nextProps.messages.length === 0;
  const noNewMessages = sameNarrow && prevProps.messages.length === nextProps.messages.length;
  const oldMessagesAdded =
    sameNarrow &&
    prevProps.messages.length > 0 &&
    nextProps.messages.length > 0 &&
    prevProps.messages[0].id > nextProps.messages[0].id;
  const newMessagesAdded =
    sameNarrow &&
    prevProps.messages.length > 0 &&
    nextProps.messages.length > 0 &&
    prevProps.messages[prevProps.messages.length - 1].id <
      nextProps.messages[nextProps.messages.length - 1].id;
  const onlyOneNewMessage =
    prevProps.messages.length > 0 &&
    nextProps.messages.length > 1 &&
    prevProps.messages[prevProps.messages.length - 1].id ===
      nextProps.messages[nextProps.messages.length - 2].id;

  return {
    sameNarrow,
    noMessages,
    noNewMessages,
    onlyOneNewMessage,
    oldMessagesAdded,
    newMessagesAdded,
  };
};
