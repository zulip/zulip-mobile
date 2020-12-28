/* @flow strict-local */

import React, { PureComponent } from 'react';
import { Text, View, TouchableWithoutFeedback } from 'react-native';

import type { Narrow, Stream, Subscription, Dispatch } from '../types';
import styles, { createStyleSheet } from '../styles';
import { connect } from '../react-redux';
import StreamIcon from '../streams/StreamIcon';
import { isTopicNarrow, topicOfNarrow } from '../utils/narrow';
import { getStreamInNarrow } from '../selectors';
import { showToast } from '../utils/info';

type SelectorProps = {|
  stream: Subscription | {| ...Stream, in_home_view: boolean |},
|};

type Props = $ReadOnly<{|
  narrow: Narrow,
  color: string,

  dispatch: Dispatch,
  ...SelectorProps,
|}>;

class TitleStream extends PureComponent<Props> {
  styles = createStyleSheet({
    outer: {
      flex: 1,
      flexDirection: 'column',
      alignItems: 'flex-start',
      justifyContent: 'flex-start',
    },
    streamRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
  });

  render() {
    const { narrow, stream, color } = this.props;

    return (
      <View style={this.styles.outer}>
        <View style={this.styles.streamRow}>
          <StreamIcon
            style={styles.halfMarginRight}
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
          <TouchableWithoutFeedback
            onLongPress={() => {
              showToast(topicOfNarrow(narrow));
            }}
          >
            <Text style={[styles.navSubtitle, { color }]} numberOfLines={1} ellipsizeMode="tail">
              {topicOfNarrow(narrow)}
            </Text>
          </TouchableWithoutFeedback>
        )}
      </View>
    );
  }
}

export default connect<SelectorProps, _, _>((state, props) => ({
  stream: getStreamInNarrow(state, props.narrow),
}))(TitleStream);
