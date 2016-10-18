import React from 'react';
import {
  Text,
  View,
} from 'react-native';
import styles from './styles';

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
