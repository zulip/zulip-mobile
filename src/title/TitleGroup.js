/* @flow strict-local */
import { connect } from 'react-redux';

import React, { PureComponent } from 'react';
import { View } from 'react-native';

import type { User } from '../types';
import { UserAvatarWithPresence } from '../common';
import { getRecipientsInGroupNarrow } from '../selectors';
import styles from '../styles';

type Props = {
  recipients: User[],
};

class TitleGroup extends PureComponent<Props> {
  render() {
    const { recipients } = this.props;

    return (
      <View style={styles.navWrapper}>
        {recipients.map((user, index) => (
          <View key={user.email} style={styles.titleAvatar}>
            <UserAvatarWithPresence size={32} avatarUrl={user.avatar_url} email={user.email} />
          </View>
        ))}
      </View>
    );
  }
}

export default connect((state, props) => ({
  recipients: getRecipientsInGroupNarrow(state, props.narrow),
}))(TitleGroup);
