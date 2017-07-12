/* @flow */
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { NULL_USER } from '../nullObjects';
import type { Narrow } from '../types';
import { normalizeRecipients } from '../utils/message';
import { isGroupNarrow } from '../utils/narrow';
import { Avatar, RawLabel, Touchable, UnreadCount } from '../common';
import { BRAND_COLOR } from '../styles';

const styles = StyleSheet.create({
  row: {
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  selectedRow: {
    backgroundColor: BRAND_COLOR,
  },
  text: {
    flex: 1,
    marginLeft: 8,
    marginRight: 8,
  },
  selectedText: {
    color: 'white',
  },
});

type Props = {
  email: string,
  users: Object[],
  unreadCount: number,
  realm: string,
  narrow?: Narrow,
  onNarrow: (arg: string) => void,
};

export default ({ email, users, narrow, unreadCount, onNarrow, realm }: Props) => {
  const allNames = email
    .split(',')
    .map(e => (users.find(x => x.email === e) || NULL_USER).fullName)
    .join(', ');
  const isSelected =
    narrow && isGroupNarrow(narrow) && email === normalizeRecipients(narrow[0].operand);

  return (
    <Touchable onPress={() => onNarrow(email)}>
      <View style={[styles.row, isSelected && styles.selectedRow]}>
        <Avatar size={32} name={allNames} realm={realm} />
        <RawLabel
          style={[styles.text, isSelected && styles.selectedText]}
          numberOfLines={2}
          ellipsizeMode="tail"
          text={allNames}
        />
        <UnreadCount count={unreadCount} />
      </View>
    </Touchable>
  );
};
