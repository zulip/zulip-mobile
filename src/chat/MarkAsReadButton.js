/* @flow strict-local */

import React, { useCallback } from 'react';
import type { Node } from 'react';

import type { Narrow } from '../types';
import { createStyleSheet } from '../styles';
import { useSelector } from '../react-redux';
import ZulipButton from '../common/ZulipButton';
import * as api from '../api';
import { getAuth, getOwnUserId } from '../selectors';
import { getUnread, getUnreadIdsForPmNarrow } from '../unread/unreadModel';
import {
  isHomeNarrow,
  isStreamNarrow,
  isTopicNarrow,
  isPmNarrow,
  streamIdOfNarrow,
  topicOfNarrow,
} from '../utils/narrow';

const styles = createStyleSheet({
  button: {
    borderRadius: 16,
    height: 32,
    paddingLeft: 12,
    paddingRight: 12,
  },
});

type Props = $ReadOnly<{|
  narrow: Narrow,
|}>;

export default function MarkAsReadButton(props: Props): Node {
  const { narrow } = props;
  const auth = useSelector(getAuth);
  const unread = useSelector(getUnread);
  const ownUserId = useSelector(getOwnUserId);

  const markAllAsRead = useCallback(() => {
    api.markAllAsRead(auth);
  }, [auth]);

  const markStreamAsRead = useCallback(() => {
    api.markStreamAsRead(auth, streamIdOfNarrow(narrow));
  }, [auth, narrow]);

  const markTopicAsRead = useCallback(() => {
    api.markTopicAsRead(auth, streamIdOfNarrow(narrow), topicOfNarrow(narrow));
  }, [auth, narrow]);

  const markPmAsRead = useCallback(() => {
    // The message IDs come from our unread-messages data, which is
    //   initialized with "only" the most recent 50K unread messages. So
    //   we'll occasionally, but rarely, miss some messages here; see #5156.
    const messageIds = getUnreadIdsForPmNarrow(unread, narrow, ownUserId);

    if (messageIds.length === 0) {
      return;
    }

    api.updateMessageFlags(auth, messageIds, 'add', 'read');
  }, [auth, unread, narrow, ownUserId]);

  if (isHomeNarrow(narrow)) {
    return <ZulipButton style={styles.button} text="Mark all as read" onPress={markAllAsRead} />;
  }

  if (isStreamNarrow(narrow)) {
    return (
      <ZulipButton style={styles.button} text="Mark stream as read" onPress={markStreamAsRead} />
    );
  }

  if (isTopicNarrow(narrow)) {
    return (
      <ZulipButton style={styles.button} text="Mark topic as read" onPress={markTopicAsRead} />
    );
  }

  if (isPmNarrow(narrow)) {
    return (
      <ZulipButton style={styles.button} text="Mark conversation as read" onPress={markPmAsRead} />
    );
  }

  return null;
}
