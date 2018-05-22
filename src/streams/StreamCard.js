/* @flow */
import React, { PureComponent } from 'react';
import { StyleSheet, View } from 'react-native';

import type { Context, Stream, Subscription } from '../types';
import { RawLabel } from '../common';
import StreamIcon from '../streams/StreamIcon';
import { NULL_SUBSCRIPTION } from '../nullObjects';

const componentStyles = StyleSheet.create({
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

export default class StreamCard extends PureComponent<Props> {
  context: Context;
  props: Props;

  static contextTypes = {
    styles: () => null,
  };

  render() {
    const { styles } = this.context;
    const { stream, subscription } = this.props;

    const name = subscription.name || stream.name;
    const description = subscription.description || stream.description;

    return (
      <View style={styles.padding}>
        <View style={componentStyles.streamRow}>
          <StreamIcon
            size={20}
            color={subscription.color || NULL_SUBSCRIPTION.color}
            isMuted={subscription ? !subscription.in_home_view : false}
            isPrivate={stream && stream.invite_only}
          />
          <RawLabel
            style={componentStyles.streamText}
            text={name}
            numberOfLines={1}
            ellipsizeMode="tail"
          />
        </View>
        <RawLabel style={componentStyles.descriptionText} text={description} />
      </View>
    );
  }
}
