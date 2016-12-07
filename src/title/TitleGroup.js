import React from 'react';
import {
  StyleSheet,
  View,
} from 'react-native';

import { Avatar } from '../common';

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
  },
  avatar: {
    paddingLeft: 4,
    paddingRight: 4,
  },
});

export default class TitleGroup extends React.PureComponent {
  render() {
    // fullName, image
    const { narrow } = this.props;
    const recipients = narrow[0].split(',');

    return (
      <View style={styles.wrapper}>
        {recipients.map(x =>
          <View style={styles.avatar}>
            <Avatar name={x} size={24} />
          </View>
        )}
      </View>
    );
  }
}
