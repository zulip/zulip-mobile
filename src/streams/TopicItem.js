/* @flow strict-local */
import React, { useContext } from 'react';
import { View } from 'react-native';
import { useActionSheet } from '@expo/react-native-action-sheet';

import styles, { BRAND_COLOR, createStyleSheet } from '../styles';
import { RawLabel, Touchable, UnreadCount } from '../common';
import { showHeaderActionSheet } from '../message/messageActionSheet';
import type { ShowActionSheetWithOptions } from '../message/messageActionSheet';
import { TranslationContext } from '../boot/TranslationProvider';
import { useDispatch, useSelector } from '../react-redux';
import { getAuth, getMute, getFlags, getSubscriptions, getOwnUser } from '../selectors';

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
  stream: string,
  name: string,
  isMuted?: boolean,
  isSelected?: boolean,
  unreadCount?: number,
  onPress: (topic: string, stream: string) => void,
|}>;

export default function TopicItem(props: Props) {
  const { name, stream, isMuted = false, isSelected = false, unreadCount = 0, onPress } = props;

  const showActionSheetWithOptions: ShowActionSheetWithOptions = useActionSheet()
    .showActionSheetWithOptions;
  const _ = useContext(TranslationContext);
  const dispatch = useDispatch();
  const backgroundData = useSelector(state => ({
    auth: getAuth(state),
    mute: getMute(state),
    subscriptions: getSubscriptions(state),
    ownUser: getOwnUser(state),
    flags: getFlags(state),
  }));

  const accessibilityLabel =
    unreadCount === 0
      ? _('Topic: {name}', {
          name,
        })
      : _('Topic: {name} ({unreadCount} unread messages)', {
          name,
          unreadCount,
        });

  return (
    <Touchable
      onPress={() => onPress(stream, name)}
      onLongPress={() => {
        showHeaderActionSheet({
          showActionSheetWithOptions,
          callbacks: { dispatch, _ },
          backgroundData,
          stream,
          topic: name,
        });
      }}
      accessibilityLabel={accessibilityLabel}
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
