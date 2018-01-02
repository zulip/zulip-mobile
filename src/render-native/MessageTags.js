/* @flow */
import React, { PureComponent } from 'react';
import { StyleSheet, View, ActivityIndicator } from 'react-native';
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
  spinner: {
    paddingTop: 2,
    paddingRight: 4,
    paddingBottom: 2,
    paddingLeft: 4,
    marginLeft: 4,
    borderRadius: 2,
  },
});

type Props = {
  timestamp: number,
  starred: boolean,
  isOutbox: boolean,
};

export default class MessageTags extends PureComponent<Props> {
  props: Props;

  render() {
    const { timestamp, starred, isOutbox } = this.props;

    if (timestamp === undefined && !starred && !isOutbox) return null;
    const editedTime = timestamp ? distanceInWordsToNow(timestamp * 1000) : '';

    return (
      <View style={styles.container}>
        {timestamp && (
          <View style={styles.tag}>
            <RawLabel style={styles.text} text={`edited ${editedTime} ago`} />
          </View>
        )}
        {starred && (
          <View style={styles.tag}>
            <Label style={styles.text} text="starred" />
          </View>
        )}
        {isOutbox && (
          <View style={styles.spinner}>
            <ActivityIndicator />
          </View>
        )}
      </View>
    );
  }
}
