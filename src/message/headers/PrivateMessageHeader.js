import React from 'react';
import {
  StyleSheet,
  View,
  Text,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

import { Touchable } from '../../common';
import { privateNarrow } from '../../utils/narrow';

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    backgroundColor: '#333',
  },
  private: {
    flex: 1,
    padding: 4,
    fontSize: 16,
    color: 'white',
  },
  icon: {
    padding: 6,
  }
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

    return (
      <Touchable onPress={this.performNarrow}>
        <View style={styles.header}>
          <Icon name="md-text" color="white" size={16} style={styles.icon} />
          <Text style={styles.private}>
            {others}
          </Text>
        </View>
      </Touchable>
    );
  }
}
