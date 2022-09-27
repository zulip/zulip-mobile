/* @flow strict-local */
import React from 'react';
import type { Node } from 'react';
import { View } from 'react-native';

import ZulipTextIntl from '../common/ZulipTextIntl';
import styles from '../styles';

export default function AnnouncementOnly(props: {||}): Node {
  return (
    <View style={styles.disabledComposeBox}>
      <ZulipTextIntl
        style={styles.disabledComposeText}
        text="Only organization admins are allowed to post to this stream."
      />
    </View>
  );
}
