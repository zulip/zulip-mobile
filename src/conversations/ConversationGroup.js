import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { normalizeRecipients } from '../utils/message';
import { isGroupNarrow } from '../utils/narrow';
import { Avatar, Touchable, UnreadCount } from '../common';
import { BRAND_COLOR } from '../common/styles';

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
  }
});

export default ({ email, users, narrow, unreadCount, onNarrow }) => {
  const emails = email.split(',');
  const allNames = emails.map(e =>
    (users.find(x => x.email === e) || {}).fullName
  ).join(', ');
  const isSelected = isGroupNarrow(narrow) && email === normalizeRecipients(narrow[0].operand);

  return (
    <Touchable onPress={() => onNarrow(email)}>
      <View style={[styles.row, isSelected && styles.selectedRow]}>
        <Avatar size={32} name={allNames} />
        <Text
          style={[styles.text, isSelected && styles.selectedText]}
          numberOfLines={2}
        >
          {allNames}
        </Text>
        <UnreadCount count={unreadCount} />
      </View>
    </Touchable>
  );
};
