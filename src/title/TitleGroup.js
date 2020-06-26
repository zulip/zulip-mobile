/* @flow strict-local */

import React, { PureComponent } from 'react';
import { StyleSheet, View, FlatList } from 'react-native';

import type { Dispatch, UserOrBot, Narrow } from '../types';
import { connect } from '../react-redux';
import { UserAvatarWithPresence } from '../common';
import { getRecipientsInGroupNarrow } from '../selectors';
import styles from '../styles';
import { navigateToAccountDetails } from '../nav/navActions';

const flatListStyles = StyleSheet.create({
  separatorView: {
    width: 16,
  },
});

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

  render() {
    const { recipients } = this.props;

    return (
      <View style={styles.navWrapper}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={flatListStyles.separatorView} />}
          data={recipients}
          renderItem={({ item }) => (
            <View key={item.email}>
              <UserAvatarWithPresence
                onPress={() => this.handlePress(item)}
                size={32}
                avatarUrl={item.avatar_url}
                email={item.email}
              />
            </View>
          )}
        />
      </View>
    );
  }
}

export default connect<SelectorProps, _, _>((state, props) => ({
  recipients: getRecipientsInGroupNarrow(state, props.narrow),
}))(TitleGroup);
