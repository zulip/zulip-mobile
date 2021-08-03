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

  if (prevProps.messages[prevProps.messages.length - 1].id < nextProps.messages[0].id) {
    // Messages replaced.
    return 'scroll-to-anchor';
  }

  if (prevProps.messages.length === nextProps.messages.length) {
    // No new messages.
    return 'preserve-position';
  }

  if (prevProps.messages[0].id > nextProps.messages[0].id) {
    // Old messages added.
    return 'preserve-position';
  }

  const newMessagesAdded =
    prevProps.messages[prevProps.messages.length - 1].id
    < nextProps.messages[nextProps.messages.length - 1].id;
  const onlyOneNewMessage =
    nextProps.messages.length > 1
    && prevProps.messages[prevProps.messages.length - 1].id
      === nextProps.messages[nextProps.messages.length - 2].id;

  // prettier-ignore
  if (
    (newMessagesAdded && !onlyOneNewMessage)
  ) {
    return 'preserve-position';
  } else if (onlyOneNewMessage) {
    return 'scroll-to-bottom-if-near-bottom';
  }

  return 'default';
};
