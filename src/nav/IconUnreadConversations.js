import React from 'react';
import { StyleSheet } from 'react-native';

import connectWithActions from '../connectWithActions';
import { getUnreadPmsTotal, getUnreadHuddlesTotal } from '../selectors';
import { IconPeople } from '../common/Icons';
import { ComponentWithOverlay, UnreadCount } from '../common';

const styles = StyleSheet.create({
  button: {
    flex: 1,
  },
});

const IconUnreadConversations = ({ unreadHuddlesTotal, unreadPmsTotal, color }) => {
  const unreadCount = unreadHuddlesTotal + unreadPmsTotal;

  return (
    <ComponentWithOverlay
      style={styles.button}
      overlaySize={15}
      showOverlay={unreadCount > 0}
      overlay={<UnreadCount count={unreadCount} />}
    >
      <IconPeople size={24} color={color} />
    </ComponentWithOverlay>
  );
};

export default connectWithActions(state => ({
  unreadHuddlesTotal: getUnreadHuddlesTotal(state),
  unreadPmsTotal: getUnreadPmsTotal(state),
}))(IconUnreadConversations);
