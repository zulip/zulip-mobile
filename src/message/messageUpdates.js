/* @flow strict-local */
// $FlowFixMe[untyped-import]
import isEqual from 'lodash.isequal';
import type { Narrow } from '../types';

// TODO: Consider completing this and making it exact, once
// `MessageList`'s props are type-checked.
type Props = $ReadOnly<{
  narrow: Narrow,
  messages: $ReadOnlyArray<$ReadOnly<{ id: number, ... }>>,
  ...
}>;

type TransitionProps = {|
  sameNarrow: boolean,
  noMessages: boolean,
  noNewMessages: boolean,
  allNewMessages: boolean,
  onlyOneNewMessage: boolean,
  oldMessagesAdded: boolean,
  newMessagesAdded: boolean,
  messagesReplaced: boolean,
|};

export type UpdateStrategy =
  | 'default'
  | 'replace'
  | 'preserve-position'
  | 'scroll-to-anchor'
  | 'scroll-to-bottom-if-near-bottom';

export const getMessageTransitionProps = (prevProps: Props, nextProps: Props): TransitionProps => {
  const sameNarrow = isEqual(prevProps.narrow, nextProps.narrow);
  const noMessages = nextProps.messages.length === 0;
  const noNewMessages = sameNarrow && prevProps.messages.length === nextProps.messages.length;
  const allNewMessages =
    sameNarrow && prevProps.messages.length === 0 && nextProps.messages.length > 0;
  const oldMessagesAdded =
    sameNarrow
    && prevProps.messages.length > 0
    && nextProps.messages.length > 0
    && prevProps.messages[0].id > nextProps.messages[0].id;
  const newMessagesAdded =
    sameNarrow
    && prevProps.messages.length > 0
    && nextProps.messages.length > 0
    && prevProps.messages[prevProps.messages.length - 1].id
      < nextProps.messages[nextProps.messages.length - 1].id;
  const onlyOneNewMessage =
    sameNarrow
    && prevProps.messages.length > 0
    && nextProps.messages.length > 1
    && prevProps.messages[prevProps.messages.length - 1].id
      === nextProps.messages[nextProps.messages.length - 2].id;
  const messagesReplaced =
    sameNarrow
    && prevProps.messages.length > 0
    && nextProps.messages.length > 0
    && prevProps.messages[prevProps.messages.length - 1].id < nextProps.messages[0].id;

  return {
    sameNarrow,
    noMessages,
    noNewMessages,
    allNewMessages,
    onlyOneNewMessage,
    oldMessagesAdded,
    newMessagesAdded,
    messagesReplaced,
  };
};

export const getMessageUpdateStrategy = (transitionProps: TransitionProps): UpdateStrategy => {
  if (transitionProps.noMessages) {
    return 'replace';
  } else if (
    !transitionProps.sameNarrow
    || transitionProps.allNewMessages
    || transitionProps.messagesReplaced
  ) {
    return 'scroll-to-anchor';
  } else if (
    transitionProps.noNewMessages
    || transitionProps.oldMessagesAdded
    || (transitionProps.newMessagesAdded && !transitionProps.onlyOneNewMessage)
  ) {
    return 'preserve-position';
  } else if (transitionProps.onlyOneNewMessage) {
    return 'scroll-to-bottom-if-near-bottom';
  }

  return 'default';
};
