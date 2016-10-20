import React from 'react';
import {
  StyleSheet,
  Navigator,
  View,
  Text,
} from 'react-native';

import Icon from 'react-native-vector-icons/Ionicons';
import { BRAND_COLOR, NAVBAR_HEIGHT, STATUSBAR_HEIGHT } from '../common/styles';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
  },
  navBar: {
    flexDirection: 'row',
    backgroundColor: BRAND_COLOR,
    paddingTop: STATUSBAR_HEIGHT,
    alignItems: 'stretch',
    justifyContent: 'space-between',
  },
  title: {
    color: 'white',
    fontSize: 16,
    lineHeight: NAVBAR_HEIGHT,
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
    const { openStreamList } = this.props;

    return (
      <Navigator
        initialRoute={{ name: 'Home', index: 0 }}
        renderScene={(route) =>
          <View style={styles.container}>
            <View style={styles.navBar}>
              <Icon style={styles.button} name="ios-menu" onPress={openStreamList} />
              <Text style={styles.button} />
              <Text style={styles.title}>
                {route.name}
              </Text>
              <Icon style={styles.button} name="ios-search" />
              <Icon style={styles.button} name="md-people" />
            </View>
            {this.props.children}
          </View>
        }
      />
    );
  }
}
