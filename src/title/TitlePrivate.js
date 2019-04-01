/* @flow strict-local */
import { connect } from 'react-redux';

import React, { PureComponent } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import type { Dispatch, UserOrBot } from '../types';
import { Touchable, UserAvatarWithPresence, ViewPlaceholder } from '../common';
import ActivityText from './ActivityText';
import { getAllUsersByEmail } from '../users/userSelectors';
import styles from '../styles';
import { navigateToAccountDetails } from '../nav/navActions';

type OwnProps = {|
  color: string,
  email: string,
|};

type StateProps = {|
  dispatch: Dispatch,
  user: UserOrBot,
|};

type Props = {|
  ...OwnProps,
  ...StateProps,
|};

class TitlePrivate extends PureComponent<Props> {
  handlePress = () => {
    const { dispatch, user } = this.props;
    dispatch(navigateToAccountDetails(user.email));
  };

  styles = StyleSheet.create({
    outer: { flex: 1 },
    inner: { flexDirection: 'row', alignItems: 'center' },
  });

  render() {
    const { user, color } = this.props;
    // $FlowFixMe: sort out CrossRealmBot
    const avatarUrl: string | null = user.avatar_url;
    return (
      <Touchable onPress={this.handlePress} style={this.styles.outer}>
        <View style={this.styles.inner}>
          <UserAvatarWithPresence size={32} email={user.email} avatarUrl={avatarUrl} />
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

export default connect((state, props) => ({
  user: getAllUsersByEmail(state).get(props.email),
}))(TitlePrivate);
