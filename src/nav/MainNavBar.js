import React from 'react';
import {
  StyleSheet,
  Navigator,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

import { BRAND_COLOR, NAVBAR_HEIGHT, STATUSBAR_HEIGHT } from '../common/styles';
import Title from '../title/Title';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
  },
  navBar: {
    flexDirection: 'row',
    backgroundColor: BRAND_COLOR,
    paddingTop: STATUSBAR_HEIGHT,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  button: {
    color: 'white',
    textAlign: 'center',
    fontSize: 26,
    padding: (NAVBAR_HEIGHT - 28) / 2,
    width: NAVBAR_HEIGHT,
  },
});

export default class MainNavBar extends React.Component {
  render() {
    const { openStreamList, onPressPeople } = this.props;

    return (
      <Navigator
        initialRoute={{ name: 'Home', index: 0 }}
        renderScene={(route) =>
          <View style={styles.container}>
            <View style={styles.navBar}>
              <Icon style={styles.button} name="ios-menu" onPress={openStreamList} />
              <Title />
              <Icon style={styles.button} name="md-people" onPress={onPressPeople} />
            </View>
            {this.props.children}
          </View>
        }
      />
    );
  }
}
