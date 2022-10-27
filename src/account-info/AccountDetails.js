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
import { getUserStatus } from '../user-statuses/userStatusesModel';
import PresenceStatusIndicator from '../common/PresenceStatusIndicator';
import { getDisplayEmailForUser } from '../selectors';

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
  boldText: {
    fontWeight: 'bold',
  },
});

type Props = $ReadOnly<{|
  user: UserOrBot,
  showEmail: boolean,
|}>;

export default function AccountDetails(props: Props): Node {
  const { user, showEmail } = props;

  const userStatusText = useSelector(state => getUserStatus(state, props.user.user_id).status_text);
  const userStatusEmoji = useSelector(
    state => getUserStatus(state, props.user.user_id).status_emoji,
  );
  const realm = useSelector(state => state.realm);
  const displayEmail = getDisplayEmailForUser(realm, user);

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
        <ZulipText
          selectable
          style={[styles.largerText, componentStyles.boldText, styles.halfMarginRight]}
          text={user.full_name}
        />
      </View>
      {displayEmail !== null && showEmail && (
        <View>
          <ZulipText
            selectable
            style={[styles.largerText, styles.halfMarginRight]}
            text={displayEmail}
          />
        </View>
      )}
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
    </ComponentList>
  );
}
