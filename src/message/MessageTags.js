/* @flow */
import React from 'react';
import { StyleSheet, View } from 'react-native';
import distanceInWordsToNow from 'date-fns/distance_in_words_to_now';

import { Label, RawLabel } from '../common';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 2,
    marginBottom: 2,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  text: {
    fontSize: 10,
    color: 'rgba(127, 127, 127, 0.75)',
  },
  tag: {
    paddingTop: 2,
    paddingRight: 4,
    paddingBottom: 2,
    paddingLeft: 4,
    marginLeft: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
});

export default class MessageTags extends React.PureComponent {
  render() {
    const { timestamp, starred } = this.props;

    if (timestamp === undefined && !starred) return null;

    const editedTime = distanceInWordsToNow(timestamp * 1000);

    return (
      <View style={styles.container}>
        {timestamp &&
          <View style={styles.tag}>
            <RawLabel style={styles.text} text={`edited ${editedTime} ago`} />
          </View>}
        {starred &&
          <View style={styles.tag}>
            <Label style={styles.text} text={'starred'} />
          </View>}
      </View>
    );
  }
}
