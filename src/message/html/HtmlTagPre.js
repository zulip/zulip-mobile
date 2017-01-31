import React from 'react';
import { Text, StyleSheet, View } from 'react-native';
import entities from 'entities';

const styles = StyleSheet.create({
  pre: {
    flexDirection: 'column',
    backgroundColor: 'yellow',
  },
  text: {
    fontFamily: 'Monaco',
  }
});

export default ({ childrenNodes, cascadingStyle }) => {
  const lines = childrenNodes
    .filter(x => x.type === 'text')
    // .split('\n')
    .map(x => entities.decodeHTML(x.data));

  return (
    <View style={styles.pre}>
      {lines.map((line, idx) =>
        <Text key={idx} style={styles.text} >{line}</Text>
      )}
    </View>
  );
};
