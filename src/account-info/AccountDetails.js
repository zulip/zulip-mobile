/* @flow strict-local */
import React from 'react';
import type { Node } from 'react';
import { View } from 'react-native';

import Emoji from '../emoji/Emoji';
import { emojiTypeFromReactionType } from '../emoji/data';
import type { UserOrBot } from '../types';
import styles, { createStyleSheet } from '../styles';
import { useSelector } from '../react-redux';
import UserAvatar from '../common/UserAvatar';
import ComponentList from '../common/ComponentList';
import ZulipText from '../common/ZulipText';
import { getOwnUser } from '../selectors';
import { getUserStatus } from '../user-statuses/userStatusesModel';
import PresenceStatusIndicator from '../common/PresenceStatusIndicator';
import ActivityText from '../title/ActivityText';
import { nowInTimeZone } from '../utils/date';

const componentStyles = createStyleSheet({
  componentListItem: {
    alignItems: 'center',
  },
  statusWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
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
  const userStatusText = useSelector(state => getUserStatus(state, props.user.user_id).status_text);
  const userStatusEmoji = useSelector(
    state => getUserStatus(state, props.user.user_id).status_emoji,
  );

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
        <ZulipText style={[styles.largerText, styles.halfMarginRight]} text={user.full_name} />
      </View>
      <View style={componentStyles.statusWrapper}>
        {userStatusEmoji && (
          <Emoji
            code={userStatusEmoji.emoji_code}
            type={emojiTypeFromReactionType(userStatusEmoji.reaction_type)}
            size={24}
          />
        )}
        {userStatusEmoji && userStatusText !== null && <View style={{ width: 2 }} />}
        {userStatusText !== null && (
          <ZulipText
            style={[styles.largerText, componentStyles.statusText]}
            text={userStatusText}
          />
        )}
      </View>
      {!isSelf && (
        <View>
          <ActivityText style={styles.largerText} user={user} />
        </View>
      )}
      {!isSelf && localTime !== null && (
        <View>
          <ZulipText style={styles.largerText} text={localTime} />
        </View>
      )}
    </ComponentList>
  );
}
