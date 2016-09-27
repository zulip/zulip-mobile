import React from 'react';
import {
  StyleSheet,
  Navigator,
  View,
  Text,
} from 'react-native';

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
    paddingLeft: 10,
    paddingRight: 10,
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
  leftButton: {
    textAlign: 'left',
    fontSize: 16,
    width: 50,
  },
  rightButton: {
    textAlign: 'right',
    fontSize: 16,
    width: 50,
  },
});

class ZulipNavBar extends React.Component {
  render() {
    return (
      <Navigator
        initialRoute={{ name: 'Home', index: 0 }}
        renderScene={(route) =>
          <View style={styles.container}>
            <View style={styles.navBar}>
              <Text style={styles.leftButton} onPress={this.props.onPressLeft}>
                Streams
              </Text>
              <View style={styles.heading}>
                <Text style={styles.headingText}>
                  {route.name}
                </Text>
              </View>
              <Text style={styles.rightButton}>Users</Text>
            </View>
            {this.props.children}
          </View>
        }
      />
    );
  }
}

export default ZulipNavBar;
