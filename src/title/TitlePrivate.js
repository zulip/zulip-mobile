/* @flow strict-local */

import React, { PureComponent } from 'react';
import { Text, View } from 'react-native';

import * as NavigationService from '../nav/NavigationService';
import type { Dispatch, UserOrBot } from '../types';
import styles, { createStyleSheet } from '../styles';
import { connect } from '../react-redux';
import { Touchable, ViewPlaceholder } from '../common';
import { UserAvatarWithPresenceById } from '../common/UserAvatarWithPresence';
import ActivityText from './ActivityText';
import { getAllUsersById } from '../users/userSelectors';
import { navigateToAccountDetails } from '../nav/navActions';

type SelectorProps = $ReadOnly<{|
  user: UserOrBot | void,
|}>;

type Props = $ReadOnly<{
  userId: number,
  color: string,

  dispatch: Dispatch,
  ...SelectorProps,
}>;

const componentStyles = createStyleSheet({
  outer: { flex: 1 },
  inner: { flexDirection: 'row', alignItems: 'center' },
});

class TitlePrivate extends PureComponent<Props> {
  render() {
    const { user, color } = this.props;
    if (!user) {
      return null;
    }
    return (
      <Touchable
        onPress={() => {
          if (!user) {
            return;
          }
          NavigationService.dispatch(navigateToAccountDetails(user.user_id));
        }}
        style={componentStyles.outer}
      >
        <View style={componentStyles.inner}>
          <UserAvatarWithPresenceById size={32} userId={user.user_id} />
          <ViewPlaceholder width={8} />
          <View>
            <Text style={[styles.navTitle, { color }]} numberOfLines={1} ellipsizeMode="tail">
              {user.full_name}
            </Text>
            <ActivityText style={[styles.navSubtitle, { color }]} user={user} />
          </View>
        </View>
      </Touchable>
    );
  }
}

export default connect<SelectorProps, _, _>((state, props) => ({
  user: getAllUsersById(state).get(props.userId),
}))(TitlePrivate);
