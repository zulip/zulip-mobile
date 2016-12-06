import React from 'react';
import {
  StyleSheet,
  Text,
  View,
} from 'react-native';

const styles = StyleSheet.create({
  title: {
    color: 'white',
    fontSize: 16,
    // lineHeight: NAVBAR_HEIGHT,
  },
});

export default class TitleTopic extends React.PureComponent {
  render() {
    return (
      <View>
        <Text style={styles.title}>
          Topic
        </Text>
      </View>
    );
  }
}
