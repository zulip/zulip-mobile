/* @flow strict-local */
import React from 'react';
import { View } from 'react-native';

import styles, { BRAND_COLOR, createStyleSheet } from '../styles';
import { RawLabel, Touchable, UnreadCount } from '../common';
import { showToast } from '../utils/info';

const componentStyles = createStyleSheet({
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

type Props = $ReadOnly<{|
  stream?: string,
  name: string,
  isMuted?: boolean,
  isSelected?: boolean,
  unreadCount?: number,
  onPress: (topic: string, stream: string) => void,
|}>;

export default function TopicItem(props: Props) {
  const {
    name,
    stream = '',
    isMuted = false,
    isSelected = false,
    unreadCount = 0,
    onPress,
  } = props;

  return (
    <Touchable
      onPress={() => {
        onPress(stream, name);
      }}
      onLongPress={() => {
        showToast(name);
      }}
    >
      <View
        style={[
          styles.listItem,
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
