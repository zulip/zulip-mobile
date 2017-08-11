/* @flow */
import React, { PureComponent } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';

import { IconStream } from '../common/Icons';
import TopicCard from './TopicCard';

const SCREEN_WIDTH = Dimensions.get('window').width;

const styles = StyleSheet.create({
  container: {
    width: SCREEN_WIDTH * 0.95,
    borderRadius: 2,
    alignSelf: 'center',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowRadius: 4,
    shadowOpacity: 0.08,
    margin: 5,
    backgroundColor: '#fff'
  },
  header: {
    backgroundColor: '#8999FF',
    padding: 8,
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
    flexDirection: 'row',
    alignItems: 'center'
  },
  headerText: {
    color: '#fff',
    fontSize: 16,
    marginLeft: 4
  }
});

const Header = () => (
    <View style={styles.header}>
      <IconStream size={16} color="#fff" />
      <Text style={styles.headerText}>mobile</Text>
    </View>
  );

export default class StreamCard extends PureComponent {
  render() {
    return (
      <View style={styles.container}>
        <Header />
        <TopicCard 
          topicName="Design"
        />
      </View>
    );
  }
};