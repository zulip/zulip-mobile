/* @flow */
import React, { PureComponent } from 'react';
import { StyleSheet, View } from 'react-native';

import type { Stream, Subscription } from '../types';
import { RawLabel } from '../common';
import StreamIcon from '../streams/StreamIcon';
import { NULL_SUBSCRIPTION } from '../nullObjects';

const styles = StyleSheet.create({
  streamRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  streamText: {
    fontSize: 20,
  },
  descriptionText: {
    opacity: 0.8,
  },
});

type Props = {
  stream: Stream,
  subscription: Subscription,
};

export default class StreamScreen extends PureComponent<Props> {
  props: Props;

  render() {
    const { stream, subscription } = this.props;

    const name = subscription.name || stream.name;
    const description = subscription.description || stream.description;

    return (
      <View>
        <View style={styles.streamRow}>
          <StreamIcon
            size={20}
            color={subscription.color || NULL_SUBSCRIPTION.color}
            isMuted={subscription && !subscription.in_home_view}
            isPrivate={stream && stream.invite_only}
          />
          <RawLabel style={styles.streamText} text={name} />
        </View>
        <RawLabel style={styles.descriptionText} text={description} />
      </View>
    );
  }
}
