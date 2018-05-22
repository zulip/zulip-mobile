/* @flow */
import React, { PureComponent } from 'react';
import { Text, View } from 'react-native';

import type { Context, Narrow, Subscription } from '../types';
import StreamIcon from '../streams/StreamIcon';
import { isTopicNarrow } from '../utils/narrow';

type Props = {
  narrow: Narrow,
  stream: Subscription,
  color: string,
};

export default class TitleStream extends PureComponent<Props> {
  context: Context;
  props: Props;

  static contextTypes = {
    styles: () => null,
  };

  render() {
    const { styles } = this.context;
    const { narrow, stream, color } = this.props;

    return (
      <View style={[styles.navWrapper, styles.titleStreamWrapper]}>
        <View style={styles.titleStreamRow}>
          <StreamIcon
            isMuted={!stream.in_home_view}
            isPrivate={stream.invite_only}
            color={color}
            size={20}
          />
          <Text style={[styles.navTitle, { color }]} numberOfLines={1} ellipsizeMode="tail">
            {stream.name}
          </Text>
        </View>
        {isTopicNarrow(narrow) && (
          <Text style={[styles.navSubtitle, { color }]} numberOfLines={1} ellipsizeMode="tail">
            {narrow[1].operand}
          </Text>
        )}
      </View>
    );
  }
}
