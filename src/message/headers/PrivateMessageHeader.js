/* @flow */
import React, { PureComponent } from 'react';
import { StyleSheet, View, Text } from 'react-native';

import type { Narrow } from '../../types';
import { Touchable } from '../../common';
import { privateNarrow, groupNarrow } from '../../utils/narrow';
import { IconPrivateChat } from '../../common/Icons';

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    backgroundColor: '#333',
    alignItems: 'center',
  },
  private: {
    flex: 1,
    padding: 8,
    fontSize: 16,
    color: 'white',
  },
  icon: {
    paddingLeft: 8,
  },
});

type Props = {
  messageId: number,
  recipients: Object[],
  doNarrow: (Narrow, number) => void,
  onLongPress: () => void,
};

export default class PrivateMessageHeader extends PureComponent<Props> {
  props: Props;

  performNarrow = () => {
    const { messageId, recipients, doNarrow } = this.props;
    const narrow =
      recipients.length === 1
        ? privateNarrow(recipients[0].email)
        : groupNarrow(recipients.map(r => r.email));
    doNarrow(narrow, messageId);
  };

  render() {
    const { recipients, onLongPress } = this.props;
    const others = recipients
      .map(r => r.full_name)
      .sort()
      .join(', ');

    return (
      <View style={[styles.container]}>
        <Touchable onPress={this.performNarrow} onLongPress={onLongPress}>
          <View style={styles.header}>
            <IconPrivateChat color="white" size={16} style={styles.icon} />
            <Text style={styles.private}>{others}</Text>
          </View>
        </Touchable>
      </View>
    );
  }
}
