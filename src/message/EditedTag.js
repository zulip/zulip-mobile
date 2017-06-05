import React from 'react';
import { StyleSheet, View } from 'react-native';
import distanceInWordsToNow from 'date-fns/distance_in_words_to_now';

import { Label } from '../common';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
  },
  text: {
    fontSize: 10,
    paddingRight: 8,
    color: '#999',
  },
});

export default class EditedTag extends React.PureComponent {
  render() {
    const { timestamp } = this.props;
    const { container, text } = styles;

    if (timestamp === undefined) return null;

    const tag = `Edited, ${distanceInWordsToNow(timestamp * 1000)}`;

    return (
      <View style={container}>
        <Label style={text} text={tag} />
      </View>
    );
  }
}
