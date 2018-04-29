/* @flow */
import React, { PureComponent } from 'react';
import { StyleSheet, View } from 'react-native';

import { BRAND_COLOR, QUARTER_COLOR } from '../styles';
import { RawLabel, Touchable, UnreadCount } from '../common';

const componentStyles = StyleSheet.create({
  rowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: QUARTER_COLOR,
  },
  selectedRow: {
    backgroundColor: BRAND_COLOR,
  },
  label: {
    flex: 1,
  },
  selectedText: {
    color: 'white',
  },
  muted: {
    opacity: 0.5,
  },
});

type Props = {
  stream: string,
  name: string,
  isMuted: boolean,
  isSelected: boolean,
  unreadCount: number,
  onPress: (topic: string, stream: string) => void,
};

export default class StreamItem extends PureComponent<Props> {
  props: Props;

  static contextTypes = {
    styles: () => null,
  };

  static defaultProps = {
    stream: '',
    isMuted: false,
    isSelected: false,
    unreadCount: 0,
  };

  handlePress = () => {
    const { name, stream, onPress } = this.props;
    onPress(stream, name);
  };

  render() {
    const { styles } = this.context;
    const { name, isMuted, isSelected, unreadCount } = this.props;

    return (
      <Touchable onPress={this.handlePress}>
        <View
          style={[
            styles.listItem,
            componentStyles.rowDivider,
            isSelected && componentStyles.selectedRow,
            isMuted && componentStyles.muted,
          ]}
        >
          <RawLabel
            style={[componentStyles.label, isSelected && componentStyles.selectedText]}
            text={name}
            numberOfLines={1}
            ellipsizeMode="tail"
          />
          <UnreadCount count={unreadCount} inverse={isSelected} />
        </View>
      </Touchable>
    );
  }
}
