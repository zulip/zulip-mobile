import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import entities from 'entities';

const styles = StyleSheet.create({
  pre: {
    flexDirection: 'column',
  },
});

export default class HtmlTagPre extends React.PureComponent {
  render() {
    const { childrenNodes } = this.props;
    const lines = childrenNodes
      .filter(x => x.type === 'text')
      // .split('\n')
      .map(x => entities.decodeHTML(x.data));

    return (
      <View style={styles.pre}>
        {lines.map((line, idx) =>
          <Text key={idx}>{line}</Text>
        )}
      </View>
    );
  }
}
