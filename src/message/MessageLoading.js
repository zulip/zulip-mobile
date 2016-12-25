import React from 'react';
import { StyleSheet, View } from 'react-native';

const styles = StyleSheet.create({
  message: {
    flexDirection: 'row',
    padding: 8,
    overflow: 'hidden',
  },
  content: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'stretch',
    marginLeft: 8,
  },
  avatar: {
    backgroundColor: '#ddd',
    borderRadius: 16,
    width: 32,
    height: 32,
  },
  subheader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  name: {
    width: 120,
    backgroundColor: '#ddd',
  },
  timestamp: {
    width: 60,
  },
  block: {
    backgroundColor: '#eee',
    borderRadius: 10,
    height: 8,
    marginBottom: 10,
  },
});

export default class MessageLoading extends React.PureComponent {

  props: {
    message: string,
    avatarUrl: string,
    fromName: string,
    fromEmail: string,
    timestamp: number,
    twentyFourHourTime: bool,
  };

  handleAvatarPress = () =>
    this.props.pushRoute('account-details', this.props.fromEmail);

  render() {
    return (
      <View style={styles.message}>
        <View style={styles.avatar} />
        <View style={styles.content}>
          <View style={styles.subheader}>
            <View style={[styles.block, styles.name]} />
            <View style={[styles.block, styles.timestamp]} />
          </View>
          <View style={styles.block} />
          <View style={styles.block} />
        </View>
      </View>
    );
  }
}
