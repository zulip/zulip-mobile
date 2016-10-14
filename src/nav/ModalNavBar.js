import React from 'react';
import {
  View,
  Text,
  TouchableHighlight,
} from 'react-native';

import styles, { HIGHLIGHT_COLOR } from '../common/styles';

class ModalBar extends React.Component {
  render() {
    const { onBack, title } = this.props;

    return (
      <View style={styles.navBar}>
        {onBack &&
          <TouchableHighlight underlayColor={HIGHLIGHT_COLOR} onPress={onBack}>
            <Text style={styles.navButton}>Back</Text>
          </TouchableHighlight>
        }
        <Text style={styles.navButton}>
          {title}
        </Text>
      </View>
    );
  }
}

export default ModalBar;
