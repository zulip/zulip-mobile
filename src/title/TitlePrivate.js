/* @flow strict-local */

import React, { PureComponent } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import type { Dispatch, UserOrBot } from '../types';
import { connect } from '../react-redux';
import { Touchable, UserAvatarWithPresence, ViewPlaceholder } from '../common';
import ActivityText from './ActivityText';
import { getAllUsersByEmail } from '../users/userSelectors';
import styles from '../styles';
import { navigateToAccountDetails } from '../nav/navActions';
import * as logging from '../utils/logging';

type SelectorProps = $ReadOnly<{|
  user: UserOrBot | void,
|}>;

type Props = $ReadOnly<{
  email: string,
  color: string,

  dispatch: Dispatch,
  ...SelectorProps,
}>;

class TitlePrivate extends PureComponent<Props> {
  handlePress = () => {
    const { dispatch, user } = this.props;
    if (!user) {
      return;
    }
    dispatch(navigateToAccountDetails(user.user_id));
  };

  styles = StyleSheet.create({
    outer: { flex: 1 },
    inner: { flexDirection: 'row', alignItems: 'center' },
  });

  componentDidUpdate(prevProps) {
    if (prevProps.user && !this.props.user) {
      logging.warn('`user` prop disappeared in TitlePrivate.', {
        email: prevProps.user.email.replace(/\w/g, 'x'),
      });
    }
  }

  render() {
    const { user, color } = this.props;
    if (!user) {
      return null;
    }
    return (
      <Touchable onPress={this.handlePress} style={this.styles.outer}>
        <View style={this.styles.inner}>
          <UserAvatarWithPresence size={32} email={user.email} avatarUrl={user.avatar_url} />
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
  // TODO: use user_id, not email (https://github.com/zulip/zulip-mobile/issues/3764)
  user: getAllUsersByEmail(state).get(props.email),
}))(TitlePrivate);
