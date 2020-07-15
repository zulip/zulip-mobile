/* @flow strict-local */
import React, { PureComponent } from 'react';
import { View } from 'react-native';

import { Label } from '../common';
import styles from '../styles';

class PmRecipientDeactivated extends PureComponent<{||}> {
  render() {
    return (
      <View style={styles.disabledComposeBox}>
        <Label
          style={styles.disabledComposeText}
          text="You can't post a message because the recipient's account has been deactivated"
        />
      </View>
    );
  }
}

export default PmRecipientDeactivated;
