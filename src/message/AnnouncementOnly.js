/* @flow */
import React, { PureComponent } from 'react';
import { View } from 'react-native';

import type { Context } from '../types';

import { Label } from '../common';

class AnnouncementOnly extends PureComponent<{}> {
  context: Context;

  static contextTypes = {
    styles: () => null,
  };

  render() {
    const { styles } = this.context;
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
