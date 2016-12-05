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
    flexBasis: 50,
  },
  description: {
    opacity: 0.75,
    fontSize: 12,
  },
  iconWrapper: {
    margin: 4,
    borderRadius: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    color: 'white',
  },
  text: {
    paddingLeft: 4,
  }
});

export default class StreamItem extends React.PureComponent {

  props: {
    name: string,
    description: string,
    iconSize: number,
    isPrivate: boolean,
    color: string,
    onPress: () => {},
  }

  handlePress = () =>
    this.props.onPress(this.props.name);

  render() {
    const { name, description, color, isPrivate, iconSize } = this.props;
    const iconWrapperCustomStyle = {
      width: iconSize + 8,
      height: iconSize + 8,
      backgroundColor: color,
    };

    return (
      <Touchable onPress={this.handlePress}>
        <View style={styles.row}>
          <View style={[styles.iconWrapper, iconWrapperCustomStyle]}>
            <Icon
              style={styles.icon}
              size={iconSize}
              color={color}
              name={isPrivate ? 'md-lock' : 'md-chatbubbles'}
            />
          </View>
          <View style={styles.text}>
            <Text>{name}</Text>
            {!!description &&
              <Text
                numberOfLines={1}
                style={styles.description}
              >
                {description}
              </Text>
            }
          </View>
        </View>
      </Touchable>
    );
  }
}
