import React from 'react';
import { Text, StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  text: {
    color: 'white',
    padding: 5,
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
    backgroundColor: '#96A3F9',
  }
});

export default class InfoLabel extends React.PureComponent {

  props: {
    text: string,
  }

  render() {
    const { text } = this.props;

    return (
      <Text style={styles.text}>
        {text || 'Information'}
      </Text>
    );
  }
}