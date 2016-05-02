import React, {
  StyleSheet,
  View,
  Text,
} from 'react-native';

const COMPOSE_VIEW_HEIGHT = 44;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#999',
    height: COMPOSE_VIEW_HEIGHT,
  },
  button: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: '#ccc',
    borderWidth: 1,
    margin: 3,
  },
  privateButton: {
    backgroundColor: '#fff',
    marginLeft: 1.5,
  },
  streamButton: {
    backgroundColor: '#fff',
    marginRight: 1.5,
  },
});

const ZulipComposeBar = () => (
  <View style={styles.container}>
    <View style={[styles.button, styles.streamButton]}>
      <Text>New stream message</Text>
    </View>
    <View style={[styles.button, styles.privateButton]}>
      <Text>New private message</Text>
    </View>
  </View>
);

export default ZulipComposeBar;
