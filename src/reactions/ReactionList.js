/* @flow */
import React from 'react';
import { StyleSheet, View } from 'react-native';

import type { ReactionType } from '../types';
import Reaction from './Reaction';
import aggregateReactions from './aggregateReactions';

const styles = StyleSheet.create({
  reactions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-start'
  },
});

export default class ReactionList extends React.PureComponent {

  props: {
    messageId: number,
    reactions: Reaction[],
    selfEmail: string,
  };

  render() {
    const { messageId, reactions, selfEmail } = this.props;

    if (!reactions || reactions.length === 0) {
      return null;
    }

    const aggregated = aggregateReactions(reactions, selfEmail);

    return (
      <View style={styles.reactions}>
        {aggregated.map((x: ReactionType, i: number) => (
          <Reaction
            key={i}
            messageId={messageId}
            name={x.name}
            voted={x.selfReacted}
            voteCount={x.count}
          />
        ))}
      </View>
    );
  }
}
