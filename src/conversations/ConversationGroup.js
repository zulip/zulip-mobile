/* @flow */
import React, { PureComponent } from 'react';
import { StyleSheet, View } from 'react-native';
import { connect } from 'react-redux';

import boundActions from '../boundActions';
import { NULL_USER } from '../nullObjects';
import type { User, Narrow } from '../types';
import { normalizeRecipients } from '../utils/message';
import { isGroupNarrow } from '../utils/narrow';
import { TextAvatar, RawLabel, Touchable, UnreadCount } from '../common';
import { BRAND_COLOR } from '../styles';

const styles = StyleSheet.create({
  row: {
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  selectedRow: {
    backgroundColor: BRAND_COLOR,
  },
  text: {
    flex: 1,
    marginLeft: 8,
    marginRight: 8,
  },
  selectedText: {
    color: 'white',
  },
});

type Props = {
  email: string,
  users: User[],
  unreadCount: number,
  narrow: Narrow,
  onPress: (emails: string) => void,
};

class ConversationGroup extends PureComponent<Props> {
  props: Props;

  handlePress = () => {
    const { email, onPress } = this.props;
    onPress(email);
  };

  render() {
    const { email, users, narrow, unreadCount } = this.props;
    const allNames = email
      .split(',')
      .map(e => (users.find(x => x.email === e) || NULL_USER).fullName)
      .join(', ');
    const isSelected =
      narrow && isGroupNarrow(narrow) && email === normalizeRecipients(narrow[0].operand);

    return (
      <Touchable onPress={this.handlePress}>
        <View style={[styles.row, isSelected && styles.selectedRow]}>
          <TextAvatar size={32} name={allNames} />
          <RawLabel
            style={[styles.text, isSelected && styles.selectedText]}
            numberOfLines={2}
            ellipsizeMode="tail"
            text={allNames}
          />
          <UnreadCount count={unreadCount} />
        </View>
      </Touchable>
    );
  }
}

export default connect(
  state => ({
    narrow: state.chat.narrow,
    users: state.users,
  }),
  boundActions,
)(ConversationGroup);
