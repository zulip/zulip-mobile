/* @flow strict-local */

import React, { PureComponent } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import type { Narrow, Stream, Subscription, Dispatch } from '../types';
import { connect } from '../react-redux';
import StreamIcon from '../streams/StreamIcon';
import { getStreamInNarrow } from '../selectors';
import styles from '../styles';

type SelectorProps = {|
  stream: Subscription | {| ...Stream, in_home_view: boolean |},
|};

type Props = {|
  narrow: Narrow,
  color: string,

  dispatch: Dispatch,
  ...SelectorProps,
|};

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
    const { stream, color } = this.props;

    return (
      <View style={this.styles.outer}>
        <View style={this.styles.streamRow}>
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
      </View>
    );
  }
}

export default connect((state, props): SelectorProps => ({
  stream: getStreamInNarrow(props.narrow)(state),
}))(TitleStream);
