/* @flow strict-local */

import React, { PureComponent } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { Narrow, Dispatch } from '../types';
import { createStyleSheet } from '../styles';
import { connect } from '../react-redux';
import { getUnreadCountForNarrow } from '../selectors';
import { Label } from '../common';
import MarkAsReadButton from './MarkAsReadButton';
import AnimatedScaleComponent from '../animation/AnimatedScaleComponent';

const styles = createStyleSheet({
  unreadContainer: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: 'hsl(232, 89%, 78%)',
    overflow: 'hidden',
  },
  safeAreaWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  unreadText: {
    fontSize: 14,
    color: 'white',
  },
});

type SelectorProps = {|
  unreadCount: number,
|};

type Props = $ReadOnly<{|
  narrow: Narrow,

  dispatch: Dispatch,
  ...SelectorProps,
|}>;

/**
 * Says how many unread messages are in the narrow.
 *
 * Pads the left and right insets with its background.
 */
class UnreadNotice extends PureComponent<Props> {
  render() {
    const { narrow, unreadCount } = this.props;

    return (
      <AnimatedScaleComponent visible={unreadCount > 0} style={styles.unreadContainer}>
        <SafeAreaView mode="padding" edges={['right', 'left']} style={styles.safeAreaWrapper}>
          <Label
            style={styles.unreadText}
            text={{
              text: `{unreadCount, plural,
  =0 {No unread messages}
  =1 {# unread message}
  other {# unread messages}
}`,
              values: { unreadCount },
            }}
          />
          <MarkAsReadButton narrow={narrow} />
        </SafeAreaView>
      </AnimatedScaleComponent>
    );
  }
}

export default connect<SelectorProps, _, _>((state, props) => ({
  unreadCount: getUnreadCountForNarrow(state, props.narrow),
}))(UnreadNotice);
