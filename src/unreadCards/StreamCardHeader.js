/* @flow */
import React, { PureComponent } from 'react';
import { View, Text, StyleSheet } from 'react-native';

import { IconStream } from '../common/Icons';

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#8999FF',
    padding: 8,
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
    flexDirection: 'row',
    alignItems: 'center'
  },
  headerText: {
    color: '#FFF',
    fontSize: 16,
    marginLeft: 4
  },
  icon: {
    color: '#FFF'
  }
});

export default class StreamCardHeader extends PureComponent {

  getHeaderStyles = () => ([
    styles.header,
    { backgroundColor: this.props.color }
  ]);

  render() {
    const { streamName, color } = this.props;

    return (
      <View style={this.getHeaderStyles()}>
        <IconStream size={16} style={styles.icon} />
        <Text style={styles.headerText}>{streamName}</Text>
      </View>
    );
  }

};
