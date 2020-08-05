/* @flow strict-local */
import React, { PureComponent } from 'react';
import { StyleSheet, View } from 'react-native';

import styles, { BRAND_COLOR, HALF_COLOR } from '../styles';
import { RawLabel, Touchable, UnreadCount } from '../common';
import { IconCheckMarkCircle } from '../common/Icons';

const componentStyles = StyleSheet.create({
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
  checkIcon: {
    marginRight: 12,
  },
  emptyCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: HALF_COLOR,
    marginRight: 12,
  },
});

type Props = $ReadOnly<{|
  stream: string,
  name: string,
  isMuted: boolean,
  isSelected: boolean,
  inBulkSelectionMode: boolean,
  isBulkSelected: boolean,
  unreadCount: number,
  onPress: (topic: string, stream: string) => void,
  onLongPress: (topic: string, stream: string) => void,
|}>;

export default class TopicItem extends PureComponent<Props> {
  static defaultProps = {
    stream: '',
    isMuted: false,
    isSelected: false,
    inBulkSelectionMode: false,
    isBulkSelected: false,
    unreadCount: 0,
  };

  handlePress = () => {
    const { name, stream, onPress } = this.props;
    onPress(stream, name);
  };

  handleLongPress = () => {
    const { name, stream, onLongPress } = this.props;
    onLongPress(stream, name);
  };

  renderBulkSelectionIcon = () => {
    const { isBulkSelected, inBulkSelectionMode } = this.props;

    if (isBulkSelected) {
      return (
        <IconCheckMarkCircle style={componentStyles.checkIcon} size={24} color={BRAND_COLOR} />
      );
    }

    if (inBulkSelectionMode) {
      return <View style={componentStyles.emptyCircle} />;
    }

    return null;
  };

  render() {
    const { name, isMuted, isSelected, unreadCount } = this.props;

    return (
      <Touchable onPress={this.handlePress} onLongPress={this.handleLongPress}>
        <View
          style={[
            styles.listItem,
            isSelected && componentStyles.selectedRow,
            isMuted && componentStyles.muted,
          ]}
        >
          {this.renderBulkSelectionIcon()}
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
