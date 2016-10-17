import React from 'react';
import {
  View,
  Text,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { styles, Touchable } from '../common';

class ModalBar extends React.Component {
  render() {
    const { onBack, title } = this.props;

    return (
      <View style={styles.navBar}>
        {onBack &&
          <Touchable onPress={onBack}>
            <Icon style={styles.navButton} name="ios-arrow-back" />
          </Touchable>
        }
        <Text style={styles.navTitle}>
          {title}
        </Text>
      </View>
    );
  }
}

export default ModalBar;
