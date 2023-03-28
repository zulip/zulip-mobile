/* @flow strict-local */

import React from 'react';
import type { Node } from 'react';
import type { TextStyleProp } from 'react-native/Libraries/StyleSheet/StyleSheet';

import type { UserOrBot } from '../types';
import { useSelector } from '../react-redux';
import { getZulipFeatureLevel } from '../selectors';
import {
  getPresence,
  getUserPresenceByEmail,
  userLastActiveAsRelativeTimeString,
} from '../presence/presenceModel';
import { getUserStatus } from '../user-statuses/userStatusesModel';
import ZulipText from '../common/ZulipText';

type Props = $ReadOnly<{|
  style: TextStyleProp,
  user: UserOrBot,
|}>;

export default function ActivityText(props: Props): Node {
  const { style } = props;

  const zulipFeatureLevel = useSelector(getZulipFeatureLevel);
  const presence = useSelector(state =>
    getUserPresenceByEmail(getPresence(state), props.user.email),
  );
  const userStatus = useSelector(state => getUserStatus(state, props.user.user_id));

  if (!presence) {
    return null;
  }

  const activeTime = userLastActiveAsRelativeTimeString(presence, userStatus, zulipFeatureLevel);

  return <ZulipText style={style} text={`Active ${activeTime}`} />;
}
