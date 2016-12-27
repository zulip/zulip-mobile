import React from 'react';
import {
  StyleSheet,
  View,
  Text,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

import { Touchable } from '../../common';
import { privateNarrow, groupNarrow } from '../../utils/narrow';

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
    paddingLeft: 10,
  }
});

export default class PrivateMessageHeader extends React.PureComponent {

  props: {
    itemId: number,
    recipients: string,
    doNarrow: () => {},
  }

  performNarrow = () => {
    const { recipients, doNarrow } = this.props;
    const narrow = recipients.length === 1 ?
      privateNarrow(recipients[0].email) :
      groupNarrow(recipients.map(r => r.email));
    doNarrow(narrow);
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
