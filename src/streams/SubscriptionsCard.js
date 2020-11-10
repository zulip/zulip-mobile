/* @flow strict-local */

import React, { PureComponent } from 'react';
import { View } from 'react-native';

import type { StreamTabsNavigationProp } from '../main/StreamTabs';
import type { Dispatch, Subscription } from '../types';
import { createStyleSheet } from '../styles';
import { connect } from '../react-redux';
import StreamList from './StreamList';
import { LoadingBanner } from '../common';
import { streamNarrow } from '../utils/narrow';
import { getUnreadByStream } from '../selectors';
import { getSubscribedStreams } from '../subscriptions/subscriptionSelectors';
import { doNarrow } from '../actions';

const styles = createStyleSheet({
  container: {
    flex: 1,
    flexDirection: 'column',
  },
});

type SelectorProps = $ReadOnly<{|
  subscriptions: Subscription[],
  unreadByStream: $ReadOnly<{ [number]: number }>,
|}>;

type Props = $ReadOnly<{|
  // Since we've put this screen in StreamTabs's route config, and we
  // don't invoke it without type-checking anywhere else (in fact, we
  // don't invoke it anywhere else at all), we know it gets the
  // `navigation` prop for free, with the particular shape for this
  // route.
  navigation: StreamTabsNavigationProp<'subscribed'>,

  dispatch: Dispatch,
  ...SelectorProps,
|}>;

class SubscriptionsCard extends PureComponent<Props> {
  handleNarrow = (streamName: string) => {
    this.props.dispatch(doNarrow(streamNarrow(streamName)));
  };

  render() {
    const { subscriptions, unreadByStream } = this.props;

    return (
      <View style={styles.container}>
        <LoadingBanner />
        <StreamList
          streams={subscriptions}
          unreadByStream={unreadByStream}
          onPress={this.handleNarrow}
        />
      </View>
    );
  }
}

export default connect<SelectorProps, _, _>((state, props) => ({
  subscriptions: getSubscribedStreams(state),
  unreadByStream: getUnreadByStream(state),
}))(SubscriptionsCard);
