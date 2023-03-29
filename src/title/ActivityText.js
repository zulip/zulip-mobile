/* @flow strict-local */

import React from 'react';
import type { Node } from 'react';
import type { TextStyleProp } from 'react-native/Libraries/StyleSheet/StyleSheet';

import type { UserOrBot } from '../types';
import { useSelector } from '../react-redux';
import { getUserLastActiveAsRelativeTimeString } from '../presence/presenceModel';
import ZulipText from '../common/ZulipText';

type Props = $ReadOnly<{|
  style: TextStyleProp,
  user: UserOrBot,
|}>;

export default function ActivityText(props: Props): Node {
  const { style, user } = props;

  const activeTime = useSelector(state =>
    getUserLastActiveAsRelativeTimeString(state, user, Date.now()),
  );
  if (activeTime == null) {
    return null;
  }

  return <ZulipText style={style} text={`Active ${activeTime}`} />;
}
