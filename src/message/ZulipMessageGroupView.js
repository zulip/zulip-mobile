import React from 'react';
import {
  StyleSheet,
  View,
  Text,
} from 'react-native';

const DEFAULT_PADDING = 8;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    backgroundColor: '#eee',
    marginBottom: DEFAULT_PADDING,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  stream: {
    backgroundColor: '#cec',
    padding: DEFAULT_PADDING,
  },
  topic: {
    padding: DEFAULT_PADDING,
  },
  private: {
    flex: 1,
    backgroundColor: '#333',
    color: '#fff',
  },
});

export const ZulipMessagePrivateHeader = (props) => (
  <View style={styles.container}>
    <View style={styles.header}>
      <Text style={[styles.threadGroupStreamText,
                    { backgroundColor: props.stream.color }]}
      >
        {props.stream.name}
      </Text>
      <Text style={styles.topic}>
        {props.thread}
      </Text>
    </View>
    {props.children}
  </View>
);

export const ZulipMessageStreamHeader = (props) => (
  <View style={styles.container}>
    <View style={styles.header}>
      <Text style={[styles.stream,
                    { backgroundColor: props.color }]}
      >
        {props.stream}
      </Text>
      <Text style={styles.topic}>
        {props.topic}
      </Text>
    </View>
    {props.children}
  </View>
);
