/* @flow strict-local */
import React, { PureComponent } from 'react';
import { View } from 'react-native';

import type { UserOrBot, Dispatch } from '../types';
import styles, { createStyleSheet } from '../styles';
import { connect } from '../react-redux';
import { UserAvatar, ComponentList, RawLabel } from '../common';
import { getUserStatusTextForUser } from '../selectors';
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

type SelectorProps = {|
  userStatusText: string | void,
|};

type Props = $ReadOnly<{|
  user: UserOrBot,

  dispatch: Dispatch,
  ...SelectorProps,
|}>;

class AccountDetails extends PureComponent<Props> {
  render() {
    const { user, userStatusText } = this.props;

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
        <View>
          <ActivityText style={styles.largerText} user={user} />
        </View>
        {localTime !== null && (
          <View>
            <RawLabel style={styles.largerText} text={localTime} />
          </View>
        )}
      </ComponentList>
    );
  }
}

export default connect<SelectorProps, _, _>((state, props) => ({
  userStatusText: getUserStatusTextForUser(state, props.user.user_id),
}))(AccountDetails);
