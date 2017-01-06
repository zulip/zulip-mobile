import React from 'react';
import { StyleSheet, View } from 'react-native';

import Reaction from './Reaction';

const styles = StyleSheet.create({
  reactions: {
    flexDirection: 'row',
  },
});

export default class ReactionList extends React.PureComponent {

  props: {
    reactions: string,
  };

  render() {
    const { reactions } = this.props;

    if (reactions.length === 0) {
      return null;
    }

    return (
      <View style={styles.reactions}>
        {reactions.map((x, i) =>
          <Reaction
            key={i}
            name={x.emoji_name}
            votedFor={false}
            voteCount={1}
          />
        )}
      </View>
    );
  }
}
