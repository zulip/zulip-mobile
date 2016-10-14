import React from 'react';
import {
  View,
  Text,
} from 'react-native';

import styles from '../common/styles';

export default class ModalBar extends React.Component {
  render() {
    return (
      <View style={styles.navBar}>
        <Text style={styles.navButton} onPress={this.props.onBack}>
          Back
        </Text>
        <Text style={styles.navButton}>
          Some Title Here
        </Text>
      </View>
    );
  }
}
