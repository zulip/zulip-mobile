import React from 'react';
import {StyleSheet, Text, View} from 'react-native';

import {Avatar} from '../common';
import {getFullUrl} from '../utils/url';

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    paddingLeft: 4,
  },
});

export default class TitlePrivate extends React.PureComponent {
  render() {
    const {narrow, realm, users, color} = this.props;
    const user = users.find(x => x.email === narrow[0].operand);
    const fullAvatarUrl = getFullUrl(user.avatarUrl, realm);

    return (
      <View style={styles.wrapper}>
        <Avatar size={24} name={user.fullName} avatarUrl={fullAvatarUrl} />
        <Text style={[styles.title, {color}]}>
          {user.fullName}
        </Text>
      </View>
    );
  }
}
