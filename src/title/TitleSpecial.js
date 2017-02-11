import React from 'react';
import {
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { foregroundColorFromBackground } from '../utils/color';

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
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
    const { narrow, backgroundColor } = this.props;
    const { name, icon } = specials[narrow[0].operand];
    const textColor = foregroundColorFromBackground(backgroundColor);

    return (
      <View style={styles.wrapper}>
        <Icon name={icon} size={20} color={textColor} />
        <Text style={[styles.title, { color: textColor }]}>
          {name}
        </Text>
      </View>
    );
  }
}
