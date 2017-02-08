import React from 'react';
import { StyleSheet, View, Text } from 'react-native';

import { BRAND_COLOR } from '../common/styles';
import { Touchable, ZulipSwitch } from '../common';
import StreamIcon from './StreamIcon';

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
  text: {
    flex: 1,
    paddingLeft: 8,
    paddingRight: 8,
  },
  selectedText: {
    color: 'white',
  },
  mutedText: {
    color: 'gray',
  },
});

export default class StreamItem extends React.PureComponent {

  props: {
    name: string,
    description: string,
    iconSize: number,
    isPrivate: boolean,
    isMuted: boolean,
    isSelected: boolean,
    showSwitch: boolean,
    color: string,
    onPress: () => {},
  }

  handlePress = () =>
    this.props.onPress(this.props.name);

  handleSwitch = (newValue) => {
    const { name, onSwitch } = this.props;
    onSwitch(name, newValue);
  }

  render() {
    const { name, description, color, isPrivate, isMuted,
      iconSize, isSelected, showSwitch, isSwitchedOn } = this.props;
    const iconWrapperCustomStyle = {
      width: iconSize * 1.75,
      height: iconSize * 1.75,
      backgroundColor: color || BRAND_COLOR,
    };

    return (
      <Touchable onPress={this.handlePress}>
        <View style={[styles.row, isSelected && styles.selectedRow]}>
          <View style={[styles.iconWrapper, iconWrapperCustomStyle]}>
            <StreamIcon
              size={iconSize}
              color="white"
              isMuted={isMuted}
              isPrivate={isPrivate}
            />
          </View>
          <View style={styles.text}>
            <Text
              style={[
                isSelected && styles.selectedText,
                isMuted && styles.mutedText
              ]}
            >
              {name}
            </Text>
            {!!description &&
              <Text
                numberOfLines={1}
                style={styles.description}
              >
                {description}
              </Text>
            }
          </View>
          {showSwitch &&
            <ZulipSwitch
              defaultValue={isSwitchedOn}
              onValueChange={this.handleSwitch}
            />}
        </View>
      </Touchable>
    );
  }
}
