import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { CONTROL_SIZE } from './styles';

const styles = StyleSheet.create({
  field: {
    flexDirection: 'row',
    height: CONTROL_SIZE,
    marginTop: 8,
  },
  error: {
    color: 'red',
  },
});

export default class ErrorMsg extends React.PureComponent {

  props: {
    error: string,
  }

  render() {
    const { error } = this.props;

    return (
      <View style={styles.field}>
        <Text style={styles.error}>{error}</Text>
      </View>
    );
  }
}
