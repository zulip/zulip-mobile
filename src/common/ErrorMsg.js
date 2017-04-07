import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {CONTROL_SIZE} from './styles';

const styles = StyleSheet.create({
  field: {
    flexDirection: 'row',
    height: CONTROL_SIZE,
    marginTop: 5,
    marginBottom: 5,
    justifyContent: 'center',
  },
  error: {
    color: 'red',
    fontSize: 16,
  },
});

export default class ErrorMsg extends React.PureComponent {
  props: {
    error: string,
  };

  render() {
    const {error} = this.props;

    return (
      <View style={styles.field}>
        <Text style={styles.error}>{error}</Text>
      </View>
    );
  }
}
