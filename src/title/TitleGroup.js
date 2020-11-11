/* @flow strict-local */

import React, { PureComponent } from 'react';
import { View } from 'react-native';

import NavigationService from '../nav/NavigationService';
import type { Dispatch, UserOrBot, Narrow } from '../types';
import styles, { createStyleSheet } from '../styles';
import { connect } from '../react-redux';
import { UserAvatarWithPresence } from '../common';
import { getRecipientsInGroupNarrow } from '../selectors';
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
    NavigationService.dispatch(navigateToAccountDetails(user.user_id));
  };

  styles = createStyleSheet({
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
