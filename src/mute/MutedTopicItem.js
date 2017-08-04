/* @flow */
import React, { PureComponent } from 'react';
import { StyleSheet, View } from 'react-native';

import { ZulipButton, RawLabel } from '../common';
import type { MutedTopic } from '../types';
import unmuteTopicApi from '../api/unmuteTopic';

const componentStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    margin: 8,
    padding: 8,
    justifyContent: 'space-between',
  },
  textWrapper: {
    flex: 3,
  },
  streamText: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  topicText: {
    fontSize: 14,
  },
  unmuteButton: {
    flex: 1,
  },
});

export default class MutedTopicItem extends PureComponent {
  static contextTypes = {
    styles: () => null,
  };

  props: {
    mutedTopic: MutedTopic,
  };

  unmuteTopic = () => {
    const { auth, mutedTopic } = this.props;
    unmuteTopicApi(auth, mutedTopic[0], mutedTopic[1]);
  };

  render() {
    const { mutedTopic, onPress } = this.props;

    return (
      <View style={[componentStyles.row, this.context.styles.cardView]}>
        <View style={componentStyles.textWrapper}>
          <RawLabel style={componentStyles.streamText} text={`#${mutedTopic[0]}`} />
          <RawLabel style={componentStyles.topicText} text={mutedTopic[1]} />
        </View>
        <ZulipButton
          style={componentStyles.unmuteButton}
          text="Unmute"
          onPress={() => this.unmuteTopic()}
        />
      </View>
    );
  }
}
