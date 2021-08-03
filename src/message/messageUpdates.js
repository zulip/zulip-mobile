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

export type UpdateStrategy =
  | 'default'
  | 'replace'
  | 'preserve-position'
  | 'scroll-to-anchor'
  | 'scroll-to-bottom-if-near-bottom';

export const getMessageUpdateStrategy = (prevProps: Props, nextProps: Props): UpdateStrategy => {
  if (nextProps.messages.length === 0) {
    // No messages.
    return 'replace';
  }

  if (!isEqual(prevProps.narrow, nextProps.narrow)) {
    // Different narrow.
    return 'scroll-to-anchor';
  }

  if (prevProps.messages.length === 0) {
    // All new messages.
    return 'scroll-to-anchor';
  }

  const noNewMessages = prevProps.messages.length === nextProps.messages.length;
  const oldMessagesAdded = prevProps.messages[0].id > nextProps.messages[0].id;
  const newMessagesAdded =
    prevProps.messages[prevProps.messages.length - 1].id
    < nextProps.messages[nextProps.messages.length - 1].id;
  const onlyOneNewMessage =
    nextProps.messages.length > 1
    && prevProps.messages[prevProps.messages.length - 1].id
      === nextProps.messages[nextProps.messages.length - 2].id;
  const messagesReplaced =
    prevProps.messages[prevProps.messages.length - 1].id < nextProps.messages[0].id;

  // prettier-ignore
  if (
    messagesReplaced
  ) {
    return 'scroll-to-anchor';
  } else if (
    noNewMessages
    || oldMessagesAdded
    || (newMessagesAdded && !onlyOneNewMessage)
  ) {
    return 'preserve-position';
  } else if (onlyOneNewMessage) {
    return 'scroll-to-bottom-if-near-bottom';
  }

  return 'default';
};
