/* @flow strict-local */
import React, { PureComponent } from 'react';
import { View } from 'react-native';

import { Label } from '../common';
import styles from '../styles';

class AnnouncementOnly extends PureComponent<{||}> {
  render(): React$Node {
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
