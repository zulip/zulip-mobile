/* @flow */
import isEqual from 'lodash.isequal';

import type { Props } from './MessageListContainer';

type TransitionProps = {
  sameNarrow: boolean,
  noMessages: boolean,
  noNewMessages: boolean,
  allNewMessages: boolean,
  onlyOneNewMessage: boolean,
  oldMessagesAdded: boolean,
  newMessagesAdded: boolean,
};

export type UpdateStrategy =
  | 'replace'
  | 'preserve-position'
  | 'scroll-to-anchor'
  | 'scroll-to-bottom'
  | 'scroll-to-bottom-if-near-bottom';

export const getMessageTransitionProps = (prevProps: Props, nextProps: Props): TransitionProps => {
  const sameNarrow = isEqual(prevProps.narrow, nextProps.narrow);
  const noMessages = nextProps.messages.length === 0;
  const noNewMessages = sameNarrow && prevProps.messages.length === nextProps.messages.length;
  const allNewMessages =
    sameNarrow && prevProps.messages.length === 0 && nextProps.messages.length > 0;
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
    allNewMessages,
    onlyOneNewMessage,
    oldMessagesAdded,
    newMessagesAdded,
  };
};

export const getMessageUpdateStrategy = (transitionProps: TransitionProps): UpdateStrategy => {
  if (transitionProps.noMessages) {
    return 'replace';
  } else if (transitionProps.noNewMessages) {
    return 'preserve-position';
  } else if (!transitionProps.sameNarrow || transitionProps.allNewMessages) {
    return 'scroll-to-anchor';
  } else if (transitionProps.onlyOneNewMessage) {
    return 'scroll-to-bottom-if-near-bottom';
  }

  return 'preserve-position';
};
