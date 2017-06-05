import React from 'react';
import { StyleSheet, View } from 'react-native';
import distanceInWordsToNow from 'date-fns/distance_in_words_to_now';

import { Label } from '../common';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end'
  },
  text: {
    fontSize: 10,
    paddingRight: 8,
    color: '#999'
  },
});

export default class MessageTags extends React.PureComponent {
  render() {
    const { timestamp, starred } = this.props;
    const { container, text } = styles;

    if (timestamp === undefined && !starred) return null;
    let tag = '';
    if (timestamp !== undefined) {
      tag = `edited ${distanceInWordsToNow(timestamp * 1000)},`;
    }
    if (starred) {
      tag = `${tag} starred`;
    }
    return (
      <View style={container}>
        <Label style={text} text={tag} />
      </View>
    );
  }
}
