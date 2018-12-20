/* @flow strict-local */
import { connect } from 'react-redux';

import React, { PureComponent } from 'react';
import { Text, View } from 'react-native';

import type { Context, Narrow, Subscription } from '../types';
import StreamIcon from '../streams/StreamIcon';
import { isTopicNarrow } from '../utils/narrow';
import { getStreamInNarrow } from '../selectors';

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
    const { styles: contextStyles } = this.context;
    const { narrow, stream, color } = this.props;

    return (
      <View style={[contextStyles.navWrapper, contextStyles.titleStreamWrapper]}>
        <View style={contextStyles.titleStreamRow}>
          <StreamIcon
            isMuted={!stream.in_home_view}
            isPrivate={stream.invite_only}
            color={color}
            size={20}
          />
          <Text style={[contextStyles.navTitle, { color }]} numberOfLines={1} ellipsizeMode="tail">
            {stream.name}
          </Text>
        </View>
        {isTopicNarrow(narrow) && (
          <Text
            style={[contextStyles.navSubtitle, { color }]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
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
