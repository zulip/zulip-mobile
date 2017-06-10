import React from 'react';
import { StyleSheet, View } from 'react-native';

import { BRAND_COLOR } from '../styles';
import { RawLabel, Touchable, ZulipSwitch, ZulipButton, Input } from '../common';
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
  topicContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingLeft: 8,
    paddingRight: 8,
  },
  field: {
    flex: 3,
  },
  sendButton: {
    height: 26,
    width: 50,
  }
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

  state: {
    topic: string,
  }

  constructor(props) {
    super(props);
    this.state = {
      topic: '',
    };
  }

  handlePress = () =>
    this.props.onPress(this.props.name);

  handleSwitch = (newValue) => {
    const { name, onSwitch } = this.props;
    onSwitch(name, newValue);
  }

  sendMessage = () => {
    const { onSend, name } = this.props;
    onSend(name, this.state.topic);
  }

  render() {
    const { name, description, color, isPrivate, isMuted,
      iconSize, isSelected, showSwitch, isSwitchedOn, shareScreen,
      expandedStreamName } = this.props;
    const iconWrapperCustomStyle = {
      width: iconSize * 1.5,
      height: iconSize * 1.5,
      backgroundColor: color || BRAND_COLOR,
    };

    return (
      <Touchable onPress={this.handlePress}>
        <View style={[styles.row, !shareScreen && isSelected && styles.selectedRow]}>
          <View style={[styles.iconWrapper, iconWrapperCustomStyle]}>
            <StreamIcon
              size={iconSize}
              color="white"
              isMuted={isMuted}
              isPrivate={isPrivate}
            />
          </View>
          <View style={styles.text}>
            <RawLabel
              style={[
                !shareScreen && isSelected && styles.selectedText,
                isMuted && styles.mutedText
              ]}
              text={name}
            />
            {!!description &&
              <RawLabel
                numberOfLines={1}
                style={styles.description}
                text={description}
              />
            }
          </View>
          {showSwitch &&
            <ZulipSwitch
              defaultValue={isSwitchedOn}
              onValueChange={this.handleSwitch}
            />}
        </View>
        {shareScreen && name === expandedStreamName &&
          <View style={styles.topicContainer}>
            <Input
              value={this.state.topic}
              style={styles.field}
              placeholder="Topic"
              blurOnSubmit={false}
              onChangeText={text => this.setState({ topic: text })}
            />
            <ZulipButton
              style={styles.sendButton}
              text="Send"
              onPress={this.sendMessage}
            />
          </View>
        }
      </Touchable>
    );
  }
}
