/* @flow strict-local */

import React, { PureComponent } from 'react';
import { StyleSheet, Text, View, TouchableWithoutFeedback } from 'react-native';

import type { Narrow, Stream, Subscription, Dispatch } from '../types';
import { connect } from '../react-redux';
import StreamIcon from '../streams/StreamIcon';
import { isTopicNarrow } from '../utils/narrow';
import { getStreamInNarrow } from '../selectors';
import styles from '../styles';
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
  styles = StyleSheet.create({
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
              showToast(narrow[1].operand);
            }}
          >
            <Text style={[styles.navSubtitle, { color }]} numberOfLines={1} ellipsizeMode="tail">
              {narrow[1].operand}
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
