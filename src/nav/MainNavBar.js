import React from 'react';
import {
  View,
  Text,
} from 'react-native';

import styles from '../common/styles';

export default class NavBar extends React.Component {
  render() {
    return (
      <View style={styles.navBar}>
        <Text style={styles.navButton} onPress={this.props.onPressLeft}>
          Streams
        </Text>
        <Text style={styles.navButton}>
          Route Name
        </Text>
        <Text style={styles.navButton}>
          Users
        </Text>
      </View>
    );
  }
}
