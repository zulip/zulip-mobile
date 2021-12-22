/* @flow strict-local */

import React from 'react';
import type { Node } from 'react';
import { View } from 'react-native';

import type { Narrow } from '../types';
import { createStyleSheet } from '../styles';
import { useSelector } from '../react-redux';
import { getUnreadCountForNarrow } from '../selectors';
import { ZulipTextIntl } from '../common';
import MarkAsReadButton from './MarkAsReadButton';
import AnimatedScaleComponent from '../animation/AnimatedScaleComponent';

const styles = createStyleSheet({
  unreadContainer: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: 'hsl(232, 89%, 78%)',
    flexDirection: 'row',
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  unreadTextWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  unreadNumber: {
    fontSize: 14,
    color: 'white',
    paddingRight: 4,
  },
  unreadText: {
    fontSize: 14,
    color: 'white',
  },
});

type Props = $ReadOnly<{|
  narrow: Narrow,
|}>;

export default function UnreadNotice(props: Props): Node {
  const { narrow } = props;
  const unreadCount = useSelector(state => getUnreadCountForNarrow(state, narrow));

  return (
    <AnimatedScaleComponent visible={unreadCount > 0} style={styles.unreadContainer}>
      <View style={styles.unreadTextWrapper}>
        <ZulipTextIntl
          style={styles.unreadText}
          text={
            // TODO(i18n): Try ICU syntax for plurals, like
            // `{unreadCount, plural,
            //   one {{unreadCount} unread message}
            //   other {{unreadCount} unread messages}
            // }`
            // We hope Transifex gives a nice UI to translators so they can
            // easily translate plurals. We've added the above message to
            // messages_en.json, and we'll see if that's the case? See:
            //   https://chat.zulip.org/#narrow/stream/58-translation/topic/ICU.20Message.20syntax/near/1300245
            unreadCount === 1
              ? '1 unread message'
              : {
                  text: '{unreadCount} unread messages',
                  values: { unreadCount: unreadCount.toString() },
                }
          }
        />
      </View>
      <MarkAsReadButton narrow={narrow} />
    </AnimatedScaleComponent>
  );
}
