/* @flow strict-local */
import React, { PureComponent } from 'react';
import { View } from 'react-native';

import { Label } from '../common';
import styles from '../styles/composeBoxStyles';

class AnnouncementOnly extends PureComponent<{}> {
  render() {
    return (
      <View style={styles.disabledComposeBox}>
        <Label
          style={styles.disabledComposeText}
          text="Only organization admins are allowed to post to this stream."
        />
      </View>
    );
  }
}

export default AnnouncementOnly;
