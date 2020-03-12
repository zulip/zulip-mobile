/* @flow strict-local */

import React, { PureComponent } from 'react';
import { StyleSheet, View } from 'react-native';

import type { Dispatch, UserOrBot, Narrow } from '../types';
import { connect } from '../react-redux';
import { UserAvatarWithPresence } from '../common';
import { getRecipientsInGroupNarrow } from '../selectors';
import styles from '../styles';
import { navigateToAccountDetails } from '../nav/navActions';

type SelectorProps = $ReadOnly<{|
  recipients: UserOrBot[],
|}>;

type Props = $ReadOnly<{|
  narrow: Narrow,

  dispatch: Dispatch,
  ...SelectorProps,
|}>;

class TitleGroup extends PureComponent<Props> {
  handlePress = (user: UserOrBot) => {
    const { dispatch } = this.props;
    dispatch(navigateToAccountDetails(user.user_id));
  };

  styles = StyleSheet.create({
    titleAvatar: {
      marginRight: 16,
    },
  });

  render() {
    const { recipients } = this.props;

    return (
      <View style={styles.navWrapper}>
        {recipients.map((user, index) => (
          <View key={user.email} style={this.styles.titleAvatar}>
            <UserAvatarWithPresence
              onPress={() => this.handlePress(user)}
              size={32}
              avatarUrl={user.avatar_url}
              email={user.email}
            />
          </View>
        ))}
      </View>
    );
  }
}

export default connect<SelectorProps, _, _>((state, props) => ({
  recipients: getRecipientsInGroupNarrow(state, props.narrow),
}))(TitleGroup);
