/* @flow strict-local */
import React from 'react';
import type { Node } from 'react';
import { View } from 'react-native';

import type { UserOrBot } from '../types';
import styles, { createStyleSheet } from '../styles';
import { useSelector } from '../react-redux';
import { UserAvatar, ComponentList, RawLabel } from '../common';
import { getOwnUser, getUserStatusTextForUser } from '../selectors';
import PresenceStatusIndicator from '../common/PresenceStatusIndicator';
import ActivityText from '../title/ActivityText';
import { nowInTimeZone } from '../utils/date';

const componentStyles = createStyleSheet({
  componentListItem: {
    alignItems: 'center',
  },
  statusWrapper: {
    justifyContent: 'center',
    flexDirection: 'row',
  },
  presenceStatusIndicator: {
    position: 'relative',
    top: 2,
    marginRight: 5,
  },
  statusText: {
    textAlign: 'center',
  },
});

type Props = $ReadOnly<{|
  user: UserOrBot,
|}>;

export default function AccountDetails(props: Props): Node {
  const { user } = props;

  const ownUser = useSelector(getOwnUser);
  const userStatusText = useSelector(state => getUserStatusTextForUser(state, props.user.user_id));

  const isSelf = user.user_id === ownUser.user_id;

  let localTime: string | null = null;
  // See comments at CrossRealmBot and User at src/api/modelTypes.js.
  if (user.timezone !== '' && user.timezone !== undefined) {
    try {
      localTime = `${nowInTimeZone(user.timezone)} Local time`;
    } catch (err) {
      // The set of timezone names in the tz database is subject to change over
      // time. Handle unrecognized timezones by quietly discarding them.
    }
  }

  return (
    <ComponentList outerSpacing itemStyle={componentStyles.componentListItem}>
      <View>
        <UserAvatar avatarUrl={user.avatar_url} size={200} />
      </View>
      <View style={componentStyles.statusWrapper}>
        <PresenceStatusIndicator
          style={componentStyles.presenceStatusIndicator}
          email={user.email}
          hideIfOffline={false}
          useOpaqueBackground={false}
        />
        <RawLabel style={[styles.largerText, styles.halfMarginRight]} text={user.full_name} />
      </View>
      {userStatusText !== undefined && (
        <RawLabel style={[styles.largerText, componentStyles.statusText]} text={userStatusText} />
      )}
      {!isSelf && (
        <View>
          <ActivityText style={styles.largerText} user={user} />
        </View>
      )}
      {!isSelf && localTime !== null && (
        <View>
          <RawLabel style={styles.largerText} text={localTime} />
        </View>
      )}
    </ComponentList>
  );
}
