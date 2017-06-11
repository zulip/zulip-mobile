import React from 'react';
import { StyleSheet, View } from 'react-native';
import distanceInWordsToNow from 'date-fns/distance_in_words_to_now';

import { Label, RawLabel } from '../common';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingRight: 8,
  },
  text: {
    fontSize: 10,
    color: '#999'
  },
  editedContainer: {
    flexDirection: 'row',
  }
});

export default class MessageTags extends React.PureComponent {
  render() {
    const { timestamp, starred } = this.props;
    const { container, text, editedContainer } = styles;

    if (timestamp === undefined && !starred) return null;

    return (
      <View style={container}>
        {timestamp &&
          <View style={editedContainer}>
            <Label style={text} text={'edited '} />
            <RawLabel style={text} text={distanceInWordsToNow(timestamp * 1000)} />
            {starred && <RawLabel style={text} text={', '} />}
          </View>
        }
        {starred && <Label style={text} text={'starred'} />}
      </View>
    );
  }
}
