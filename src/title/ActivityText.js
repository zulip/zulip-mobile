/* @flow strict-local */

import React from 'react';
import type { Node } from 'react';
import type { TextStyleProp } from 'react-native/Libraries/StyleSheet/StyleSheet';

import type { UserOrBot } from '../types';
import { useSelector } from '../react-redux';
import { getPresence, getUserStatus } from '../selectors';
import { presenceToHumanTime } from '../utils/presence';
import { ZulipText } from '../common';

type Props = $ReadOnly<{|
  style: TextStyleProp,
  user: UserOrBot,
|}>;

export default function ActivityText(props: Props): Node {
  const { style } = props;
  const presence = useSelector(state => getPresence(state)[props.user.email]);
  const userStatus = useSelector(state => getUserStatus(state)[props.user.user_id]);

  if (!presence) {
    return null;
  }

  const activity = presenceToHumanTime(presence, userStatus);

  return <ZulipText style={style} text={`Active ${activity}`} />;
}
