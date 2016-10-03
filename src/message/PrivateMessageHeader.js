import React from 'react';
import {
  StyleSheet,
  View,
  Text,
} from 'react-native';

import { privateNarrow } from '../lib/narrow';

const DEFAULT_PADDING = 8;

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    overflow: 'hidden',
    backgroundColor: '#ddd',
  },
  stream: {
    backgroundColor: '#cec',
    padding: DEFAULT_PADDING,
    fontSize: 16,
  },
  topic: {
    padding: DEFAULT_PADDING,
    fontSize: 16,
  },
  private: {
    flex: 1,
    backgroundColor: '#333',
    color: '#fff',
  },
});

export default class PrivateMessageHeader extends React.PureComponent {

  render() {
    const others = this.props.recipients.map(r => r.full_name).sort().join(', ');
    const title = others ? `You and ${others}` : 'Just You';

    return (
      <View style={styles.header}>
        <Text
          style={[styles.stream, styles.private]}
          onPress={() => this.props.narrow(
            privateNarrow(this.props.recipients.map(r => r.email)),
            this.props.item.id,
            [this.props.item]
          )}
        >
          {title}
        </Text>
      </View>
    );
  }
}
