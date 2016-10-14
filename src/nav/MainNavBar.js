import React from 'react';
import {
  StyleSheet,
  Navigator,
  View,
  Text,
} from 'react-native';

import Icon from 'react-native-vector-icons/Ionicons';
import { BRAND_COLOR, STATUS_BAR_HEIGHT } from '../common/styles';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
  },
  navBar: {
    flexDirection: 'row',
    backgroundColor: BRAND_COLOR,
    paddingTop: STATUS_BAR_HEIGHT,
    alignItems: 'stretch',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#999',
  },
  navButton: {
    color: 'white',
    textAlign: 'center',
    padding: 8,
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
