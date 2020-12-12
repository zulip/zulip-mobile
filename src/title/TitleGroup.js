/* @flow strict-local */

import React, { PureComponent } from 'react';
import { View } from 'react-native';

import NavigationService from '../nav/NavigationService';
import type { Dispatch, UserOrBot, Narrow } from '../types';
import styles, { createStyleSheet } from '../styles';
import { connect } from '../react-redux';
import { UserAvatarWithPresenceById } from '../common/UserAvatarWithPresence';
import { getRecipientsInGroupPmNarrow } from '../selectors';
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
            <UserAvatarWithPresenceById
              onPress={() => this.handlePress(user)}
              size={32}
              userId={user.user_id}
            />
          </View>
        ))}
      </View>
    );
  }
}

export default connect<SelectorProps, _, _>((state, props) => ({
  recipients: getRecipientsInGroupPmNarrow(state, props.narrow),
}))(TitleGroup);
