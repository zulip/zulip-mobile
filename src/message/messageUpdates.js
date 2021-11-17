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
  | 'none'
  | 'preserve-position'
  | 'scroll-to-anchor'
  | 'scroll-to-bottom-if-near-bottom';

export const getMessageUpdateStrategy = (prevProps: Props, nextProps: Props): UpdateStrategy => {
  const prevMessages = prevProps.messages;
  const nextMessages = nextProps.messages;

  if (nextMessages.length === 0) {
    // No messages.
    return 'none';
  }

  if (!isEqual(prevProps.narrow, nextProps.narrow)) {
    // Different narrow.
    return 'scroll-to-anchor';
  }

  if (prevMessages.length === 0) {
    // All new messages.
    return 'scroll-to-anchor';
  }

  if (prevMessages[prevMessages.length - 1].id < nextMessages[0].id) {
    // Messages replaced.
    return 'scroll-to-anchor';
  }

  if (prevMessages.length === nextMessages.length) {
    // No new messages.
    return 'preserve-position';
  }

  if (prevMessages[0].id > nextMessages[0].id) {
    // Old messages added.
    return 'preserve-position';
  }

  if (
    nextMessages.length > 1
    && prevMessages[prevMessages.length - 1].id === nextMessages[nextMessages.length - 2].id
  ) {
    // Only one new message.
    return 'scroll-to-bottom-if-near-bottom';
  }

  return 'preserve-position';
};
