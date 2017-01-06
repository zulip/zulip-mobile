import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import Emoji from '../emoji/Emoji';

const styles = StyleSheet.create({
  reaction: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 4,
    borderRadius: 4,
    borderWidth: 1,
    marginRight: 4,
  },
  voted: {
    borderColor: '#3aa3e3', // eslint-disable-line
    backgroundColor: '#f0f7fb', // eslint-disable-line
  },
  notVoted: {
    borderColor: '#dedede', // eslint-disable-line
  },
  count: {
    marginLeft: 4,
  }
});

export default class Reaction extends React.PureComponent {

  props: {
    name: string,
    voted: boolean,
  };

  render() {
    const { name, voted, voteCount } = this.props;
    const colorStyle = voted ? styles.voted : styles.notVoted;

    return (
      <View style={[styles.reaction, colorStyle]}>
        <Emoji name={name} />
        <Text style={styles.count}>
          {voteCount}
        </Text>
      </View>
    );
  }
}
