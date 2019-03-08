/* @flow strict-local */
import { connect } from 'react-redux';

import React, { PureComponent } from 'react';
import { StyleSheet, View } from 'react-native';

import type { Dispatch, User } from '../types';
import { UserAvatarWithPresence } from '../common';
import { getRecipientsInGroupNarrow } from '../selectors';
import styles from '../styles';
import { navigateToAccountDetails } from '../nav/navActions';

type Props = {
  dispatch: Dispatch,
  recipients: User[],
};

class TitleGroup extends PureComponent<Props> {
  handlePress = user => {
    const { dispatch } = this.props;
    dispatch(navigateToAccountDetails(user.email));
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

export default connect((state, props) => ({
  recipients: getRecipientsInGroupNarrow(state, props.narrow),
}))(TitleGroup);
