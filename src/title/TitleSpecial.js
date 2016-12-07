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
    alignItems: 'center',
  },
  title: {
    color: 'white',
    fontSize: 16,
    marginLeft: 4,
  },
});

const specials = {
  home: { name: 'Home', icon: 'md-home' },
  private: { name: 'Private Messages', icon: 'md-chatboxes' },
  starred: { name: 'Starred', icon: 'md-star' },
  mentioned: { name: 'Mentions', icon: 'md-at' },
};

export default class TitleSpecial extends React.PureComponent {
  render() {
    const { narrow } = this.props;
    const { name, icon } = specials[narrow[0].operand];

    return (
      <View style={styles.wrapper}>
        <Icon name={icon} size={16} color="white" />
        <Text style={styles.title}>
          {name}
        </Text>
      </View>
    );
  }
}
