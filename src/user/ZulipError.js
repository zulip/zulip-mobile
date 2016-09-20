import React from 'react';
import {
  Text,
  View,
} from 'react-native';
import styles from './styles';

export default class ZulipError extends React.Component {

  render() {
    const { errors } = this.props;

    return (
      <View style={styles.field}>
        {errors.map((err) =>
          <Text key={err.timestamp} style={styles.error}>
            {err.message}
          </Text>
        )}
      </View>
    );
  }
}
