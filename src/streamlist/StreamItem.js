import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

import { BRAND_COLOR } from '../common/styles';
import { Touchable } from '../common';

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    flexGrow: 50,
    padding: 8,
  },
  selectedRow: {
    backgroundColor: BRAND_COLOR,
  },
  description: {
    opacity: 0.75,
    fontSize: 12,
  },
  iconWrapper: {
    borderRadius: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    color: 'white',
  },
  text: {
    paddingLeft: 8,
  },
  selectedText: {
    color: 'white',
  }
});

export default class StreamItem extends React.PureComponent {

  props: {
    name: string,
    description: string,
    iconSize: number,
    isPrivate: boolean,
    isSelected: boolean,
    color: string,
    onPress: () => {},
  }

  handlePress = () =>
    this.props.onPress(this.props.name);

  render() {
    const { name, description, color, isPrivate, iconSize, isSelected } = this.props;
    const iconWrapperCustomStyle = {
      width: iconSize * 1.75,
      height: iconSize * 1.75,
      backgroundColor: color,
    };

    return (
      <Touchable onPress={this.handlePress}>
        <View style={[styles.row, isSelected && styles.selectedRow]}>
          <View style={[styles.iconWrapper, iconWrapperCustomStyle]}>
            <Icon
              style={styles.icon}
              size={iconSize}
              color={color}
              name={isPrivate ? 'lock' : 'hashtag'}
            />
          </View>
          <View style={styles.text}>
            <Text style={isSelected && styles.selectedText}>{name}</Text>
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
