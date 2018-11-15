/* @flow strict-local */
import React, { PureComponent } from 'react';
import { StyleSheet, View } from 'react-native';

import type { Stream, Subscription } from '../types';
import { RawLabel } from '../common';
import StreamIcon from '../streams/StreamIcon';
import { NULL_SUBSCRIPTION } from '../nullObjects';
import styles from '../styles';

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
    marginTop: 16,
  },
  streamIcon: {
    marginRight: 8,
  },
});

type Props = {|
  stream: Stream,
  subscription: Subscription,
|};

export default class StreamCard extends PureComponent<Props> {
  render() {
    const { stream, subscription } = this.props;

    const name = subscription.name || stream.name;
    const description = subscription.description || stream.description;

    return (
      <View style={styles.padding}>
        <View style={componentStyles.streamRow}>
          <StreamIcon
            style={componentStyles.streamIcon}
            size={22}
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
        {description.length > 0 && (
          <RawLabel style={componentStyles.descriptionText} text={description} />
        )}
      </View>
    );
  }
}
