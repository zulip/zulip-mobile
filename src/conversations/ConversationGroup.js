/* @flow */
import React, { PureComponent } from 'react';
import { StyleSheet, View } from 'react-native';

import { NULL_USER } from '../nullObjects';
import { TextAvatar, RawLabel, Touchable, UnreadCount } from '../common';

const componentStyles = StyleSheet.create({
  text: {
    flex: 1,
    marginLeft: 8,
    marginRight: 8,
  },
});

type Props = {
  email: string,
  usersByEmail: Object,
  unreadCount: number,
  onPress: (emails: string) => void,
};

export default class ConversationGroup extends PureComponent<Props> {
  props: Props;

  static contextTypes = {
    styles: () => null,
  };

  handlePress = () => {
    const { email, onPress } = this.props;
    onPress(email);
  };

  render() {
    const { styles } = this.context;
    const { email, usersByEmail, unreadCount } = this.props;
    const allNames = email
      .split(',')
      .map(e => (usersByEmail[e] || NULL_USER).full_name)
      .join(', ');

    return (
      <Touchable onPress={this.handlePress}>
        <View style={styles.listItem}>
          <TextAvatar size={32} name={allNames} />
          <RawLabel
            style={componentStyles.text}
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
