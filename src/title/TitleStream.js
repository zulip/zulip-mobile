/* @flow strict-local */
import { connect } from 'react-redux';

import React, { PureComponent } from 'react';
import { Text, View } from 'react-native';

import type { Context, Narrow, Subscription } from '../types';
import StreamIcon from '../streams/StreamIcon';
import { isTopicNarrow } from '../utils/narrow';
import { getStreamInNarrow } from '../selectors';
import styles from '../styles';

type Props = {|
  narrow: Narrow,
  stream: Subscription,
  color: string,
|};

class TitleStream extends PureComponent<Props> {
  context: Context;

  static contextTypes = {
    styles: () => null,
  };

  render() {
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

export default connect((state, props) => ({
  stream: getStreamInNarrow(props.narrow)(state),
}))(TitleStream);
