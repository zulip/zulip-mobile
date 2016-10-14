import React from 'react';
import {
  StyleSheet,
  Navigator,
  View,
  Text,
} from 'react-native';

import Icon from 'react-native-vector-icons/Ionicons';

const NAV_BAR_HEIGHT = 44;
const STATUS_BAR_HEIGHT = 20;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
  },
  navBar: {
    flexDirection: 'row',
    height: NAV_BAR_HEIGHT + STATUS_BAR_HEIGHT,
    backgroundColor: '#fff',
    paddingTop: STATUS_BAR_HEIGHT,
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#999',
  },
  heading: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
  },
  headingText: {
    fontSize: 16,
  },
  button: {
    textAlign: 'center',
    fontSize: 26,
    width: 46,
  },
});

export default class NavBar extends React.Component {
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
              <View style={styles.heading}>
                <Text style={styles.headingText}>
                  {route.name}
                </Text>
              </View>
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
