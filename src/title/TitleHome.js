import React from 'react';
import {
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
  },
  title: {
    color: 'white',
    fontSize: 16,
  },
});

export default class TitleSpecial extends React.PureComponent {
  render() {
    return (
      <View style={styles.wrapper}>
        <Icon />
        <Text style={styles.title}>
          Special
        </Text>
      </View>
    );
  }
}
