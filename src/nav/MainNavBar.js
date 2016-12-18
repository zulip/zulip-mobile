import React from 'react';
import {
  StyleSheet,
  Navigator,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

import styles from '../common/styles';

import Title from '../title/Title';

const moreStyles = StyleSheet.create({
  wrapper: {
    flex: 1,
    flexDirection: 'column',
  },
});

export default class MainNavBar extends React.Component {
  render() {
    const { openStreamList, onPressPeople } = this.props;

    return (
      <Navigator
        initialRoute={{ name: 'Home', index: 0 }}
        renderScene={(route) =>
          <View style={moreStyles.wrapper}>
            <View style={styles.navBar}>
              <Icon style={styles.navButton} name="ios-menu" onPress={openStreamList} />
              <Title />
              <Icon style={styles.navButton} name="md-people" onPress={onPressPeople} />
            </View>
            {this.props.children}
          </View>
        }
      />
    );
  }
}
