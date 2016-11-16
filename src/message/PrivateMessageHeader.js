import React from 'react';
import {
  StyleSheet,
  View,
  Text,
} from 'react-native';

import { privateNarrow } from '../lib/narrow';

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    overflow: 'hidden',
    backgroundColor: '#ddd',
  },
  private: {
    flex: 1,
    padding: 4,
    fontSize: 16,
    backgroundColor: '#333',
    color: '#fff',
  },
});

export default class PrivateMessageHeader extends React.PureComponent {

  performNarrow = () => {
    const { recipients, narrow, item } = this.props;
    narrow(
      privateNarrow(recipients.map(r => r.email)),
      item.id,
      [item]
    );
  }

  render() {
    const { recipients } = this.props;
    const others = recipients.map(r => r.full_name).sort().join(', ');
    const title = others ? `You and ${others}` : 'Just You';

    return (
      <View style={styles.header}>
        <Text
          style={styles.private}
          onPress={this.performNarrow}
        >
          {title}
        </Text>
      </View>
    );
  }
}
