/* @flow strict-local */
import React, { PureComponent } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';

import type { UserOrBot, Dispatch } from '../types';
import { connect } from '../react-redux';
import { UserAvatar, ComponentList, RawLabel } from '../common';
import { getCurrentRealm, getUserStatusTextForUser } from '../selectors';
import PresenceStatusIndicator from '../common/PresenceStatusIndicator';
import ActivityText from '../title/ActivityText';
import { getAvatarFromUser } from '../utils/avatar';
import { nowInTimeZone } from '../utils/date';
import { navigateToAccountDetails } from '../nav/navActions';
import { getAllUsersById } from '../users/userSelectors';
import { IconRobot } from '../common/Icons';
import type { ThemeColors } from '../styles';
import styles, { ThemeContext } from '../styles';

const componentStyles = StyleSheet.create({
  componentListItem: {
    alignItems: 'center',
  },
  statusWrapper: {
    justifyContent: 'center',
    flexDirection: 'row',
  },
  statusText: {
    textAlign: 'center',
    fontSize: 17,
  },
});

const AVATAR_SIZE = 200;

type SelectorProps = {|
  realm: string,
  usersById: Map<number, UserOrBot>,
  userStatusText: string | void,
|};

type Props = $ReadOnly<{|
  user: UserOrBot,
  dispatch: Dispatch,
  ...SelectorProps,
|}>;

class AccountDetails extends PureComponent<Props> {
  static contextType = ThemeContext;
  context: ThemeColors;

  handlePress = () => {
    const { user, dispatch } = this.props;
    if (user.bot_owner_id === undefined) {
      return;
    }
    dispatch(navigateToAccountDetails(user.bot_owner_id));
  };

  render() {
    const { realm, user, userStatusText, usersById } = this.props;

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

    const botOwner =
      user.is_bot && user.bot_owner_id !== undefined ? usersById.get(user.bot_owner_id) : undefined;

    return (
      <ComponentList outerSpacing spacing={12} itemStyle={componentStyles.componentListItem}>
        <View>
          <UserAvatar avatarUrl={getAvatarFromUser(user, realm, AVATAR_SIZE)} size={AVATAR_SIZE} />
        </View>
        <View style={componentStyles.statusWrapper}>
          <RawLabel style={[styles.largerText, styles.halfMarginRight]} text={user.full_name} />
          {user.is_bot && <IconRobot size={20} style={{ color: this.context.color }} />}
          <PresenceStatusIndicator email={user.email} hideIfOffline={false} />
        </View>
        {userStatusText !== undefined && (
          <RawLabel style={componentStyles.statusText} text={userStatusText} />
        )}
        <RawLabel style={componentStyles.statusText} text={user.email} />
        {botOwner !== undefined && (
          <View style={componentStyles.statusWrapper}>
            <RawLabel style={componentStyles.statusText} text="Owner: " />
            <TouchableOpacity onPress={this.handlePress}>
              <RawLabel
                style={[componentStyles.statusText, { textDecorationLine: 'underline' }]}
                text={botOwner.full_name}
              />
            </TouchableOpacity>
          </View>
        )}
        <View>
          <ActivityText style={componentStyles.statusText} user={user} />
        </View>
        {localTime !== null && (
          <View>
            <RawLabel style={componentStyles.statusText} text={localTime} />
          </View>
        )}
      </ComponentList>
    );
  }
}

export default connect<SelectorProps, _, _>((state, props) => ({
  realm: getCurrentRealm(state),
  usersById: getAllUsersById(state),
  userStatusText: getUserStatusTextForUser(state, props.user.user_id),
}))(AccountDetails);
