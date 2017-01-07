import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import Emoji from '../emoji/Emoji';

const styles = StyleSheet.create({
  frameCommon: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 4,
    borderRadius: 4,
    borderWidth: 1,
    marginRight: 4,
  },
  frameVoted: {
    borderColor: '#3aa3e3', // eslint-disable-line
    backgroundColor: '#f0f7fb', // eslint-disable-line
  },
  frameNotVoted: {
    borderColor: '#dedede', // eslint-disable-line
  },
  countCommon: {
    marginLeft: 4,
  },
  countVoted: {
    color: '#3aa3e3', // eslint-disable-line
  },
  countNotVoted: {
    color: 'gray',
  },
});

export default class Reaction extends React.PureComponent {

  props: {
    name: string,
    voted: boolean,
  };

  render() {
    const { name, voted, voteCount } = this.props;
    const frameStyle = voted ? styles.frameVoted : styles.frameNotVoted;
    const countStyle = voted ? styles.countVoted : styles.countNotVoted;

    return (
      <View style={[styles.frameCommon, frameStyle]}>
        <Emoji name={name} />
        <Text style={[styles.countCommon, countStyle]}>
          {voteCount}
        </Text>
      </View>
    );
  }
}
