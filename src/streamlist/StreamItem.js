import React from 'react';
import {
  StyleSheet,
  View,
  Text,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

import { Touchable } from '../common';

const styles = StyleSheet.create({
  row: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    height: 50,
  },
  description: {
    opacity: 0.75,
  },
  iconWrapper: {
    width: 22,
    height: 22,
    margin: 4,
    borderRadius: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    color: 'white',
  },
});

export default class StreamItem extends React.PureComponent {

  props: {
    name: string,
    description: string,
    isPrivate: boolean,
    color: string,
    onPress: () => {},
  }

  render() {
    const { name, description, color, isPrivate, onPress } = this.props;

    return (
      <Touchable onPress={onPress}>
        <View style={styles.row}>
          <View style={[styles.iconWrapper, { backgroundColor: color }]}>
            <Icon
              style={styles.icon}
              size={16}
              name={isPrivate ? 'md-lock' : 'md-chatbubbles'}
            />
          </View>
          <View>
            <Text>{name}</Text>
            {description && description.length > 0 &&
              <Text style={styles.description}>{description}</Text>}
          </View>
        </View>
      </Touchable>
    );
  }
}
