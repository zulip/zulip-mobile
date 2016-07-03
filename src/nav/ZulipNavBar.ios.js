import React, {
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
    fontSize: 14,
  },
  headingCarot: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  leftButton: {
    width: 40,
    fontFamily: 'Apple SD Gothic Neo',
    textAlign: 'left',
  },
  rightButton: {
    width: 40,
    textAlign: 'right',
  },
});

const ZulipNavBar = (props) => (
  <Navigator
    initialRoute={{ name: 'All Streams', index: 0 }}
    renderScene={(route) =>
      <View style={styles.container}>
        <View style={styles.navBar}>
          <Text style={styles.leftButton}>Streams</Text>
          <View style={styles.heading}>
            <Text style={styles.headingText}>{route.name}</Text>
          </View>
          <Text style={styles.rightButton}>Users</Text>
        </View>
        {props.children}
      </View>
    }
  />
);

export default ZulipNavBar;
