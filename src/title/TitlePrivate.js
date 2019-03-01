/* @flow strict-local */
import { connect } from 'react-redux';

import React, { PureComponent } from 'react';
import { Text, View } from 'react-native';

import type { Dispatch, UserOrBot } from '../types';
import { Touchable, UserAvatarWithPresence, ViewPlaceholder } from '../common';
import ActivityText from './ActivityText';
import { getAllUsersByEmail } from '../users/userSelectors';
import styles from '../styles';
import { navigateToAccountDetails } from '../nav/navActions';

type Props = {
  dispatch: Dispatch,
  user: UserOrBot,
  color: string,
};

class TitlePrivate extends PureComponent<Props> {
  handlePress = () => {
    const { dispatch, user } = this.props;
    dispatch(navigateToAccountDetails(user.email));
  };

  render() {
    const { user, color } = this.props;
    // $FlowFixMe: sort out RealmBot
    const avatarUrl: string | null = user.avatar_url;
    return (
      <Touchable onPress={this.handlePress} style={styles.navWrapper}>
        <UserAvatarWithPresence size={32} email={user.email} avatarUrl={avatarUrl} />
        <ViewPlaceholder width={8} />
        <View>
          <Text style={[styles.navTitle, { color }]} numberOfLines={1} ellipsizeMode="tail">
            {user.full_name}
          </Text>
          <ActivityText style={styles.navSubtitle} color={color} email={user.email} />
        </View>
      </Touchable>
    );
  }
}

export default connect((state, props) => ({
  user: getAllUsersByEmail(state).get(props.email),
}))(TitlePrivate);
