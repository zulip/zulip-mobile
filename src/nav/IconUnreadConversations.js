import React from 'react';
import { connect } from 'react-redux';

import boundActions from '../boundActions';
import { getUnreadPmsTotal, getUnreadHuddlesTotal } from '../selectors';
import { IconPeople } from '../common/Icons';
import { ComponentWithOverlay, UnreadCount } from '../common';

const IconUnreadConversations = ({ unreadHuddlesTotal, unreadPmsTotal, color }) => {
  const unreadCount = unreadHuddlesTotal + unreadPmsTotal;

  return (
    <ComponentWithOverlay
      overlaySize={15}
      showOverlay={unreadCount > 0}
      overlay={<UnreadCount count={unreadCount} />}>
      <IconPeople size={30} color={color} />
    </ComponentWithOverlay>
  );
};

export default connect(
  state => ({
    unreadHuddlesTotal: getUnreadHuddlesTotal(state),
    unreadPmsTotal: getUnreadPmsTotal(state),
  }),
  boundActions,
)(IconUnreadConversations);
