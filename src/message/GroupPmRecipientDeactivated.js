/* @flow strict-local */
import React, { PureComponent } from 'react';
import { View } from 'react-native';

import { Label } from '../common';
import styles from '../styles';

class GroupPmRecipientDeactivated extends PureComponent<{||}> {
  render() {
    return (
      <View style={styles.disabledComposeBox}>
        <Label
          style={styles.disabledComposeText}
          text="You can't post a message because one or more recipients' accounts have been deactivated"
        />
      </View>
    );
  }
}

export default GroupPmRecipientDeactivated;
