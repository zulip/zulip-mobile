import React, {
  StyleSheet,
  View,
  Text,
} from 'react-native';

const DEFAULT_PADDING = 8;

const styles = StyleSheet.create({
  threadGroup: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: '#eee',
    marginBottom: DEFAULT_PADDING,
    borderWidth: 1,
    borderColor: '#eee',
  },
  threadGroupHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  threadGroupStreamText: {
    backgroundColor: '#cec',
    padding: DEFAULT_PADDING,
  },
  threadGroupThreadText: {
    padding: DEFAULT_PADDING,
  },
});

const ZulipStreamMessageGroup = (props) => (
  <View style={styles.threadGroup}>
    <View style={styles.threadGroupHeader}>
      <Text style={[styles.threadGroupStreamText,
                    { backgroundColor: props.stream.color }]}
      >
        {props.stream.name}
      </Text>
      <Text style={styles.threadGroupThreadText}>
        {props.thread}
      </Text>
    </View>
    {props.children}
  </View>
);

export default ZulipStreamMessageGroup;
