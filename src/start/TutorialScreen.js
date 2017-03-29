import React, { Component } from 'react';
import { connect } from 'react-redux';
import boundActions from '../boundActions';
import { Text, View, Image, StyleSheet } from 'react-native';

import AppIntro from 'react-native-app-intro';

class TutorialScreen extends React.Component {

  onSkipBtnHandle = (index) => {
    this.props.pushRoute('realm');
    console.log(index);
  }

  doneBtnHandle = () => {
    this.props.pushRoute('realm');
  }
  nextBtnHandle = (index) => {
    console.log(index);
  }
  onSlideChangeHandle = (index, total) => {
    console.log(index, total);
  }
  
  render() {
    const pageArray = [{
      title: 'Zulip',
      description: 'A powerful open source group chat app.',
      backgroundColor: '#a4b602',
      fontColor: '#fff',
      level: 10,
      img: require('../../assets/zulip_logo.png'),
      imgStyle: {
        height: 500*0.4,
        width: 500*0.4,
      },
    },  {
      title: 'Streams',
      description: 'Chatrooms that you can join, leave or even make. Messages in Zulip go to a stream and have a topic.',
      backgroundColor: '#76b600',
      fontColor: '#fff',
      level: 10,
      img: require('../../assets/streams.png'),
      imgStyle: {
        height: 469*0.375,
        width: 844*0.375,
      },
    }, {
      title: 'Topics',
      description: 'Every conversation in Zulip has a topic, so it’s easy to keep conversations straight. One or two words that describe what it\'s all about.',
      backgroundColor: '#10b601',
      fontColor: '#fff',
      level: 10,
      img: require('../../assets/topics.png'),
      imgStyle: {
        height: 518*0.375,
        width: 844*0.375,
      },
    }, {
      title: 'And everything else...',
      description: 'Fast and powerful search, group private messages, audible notifications, missed-message emails, desktop apps and even emojis!',
      backgroundColor: '#1f5133',
      fontColor: '#fff',
      level: 10,
      img: require('../../assets/everything_else.png'),
      imgStyle: {
        height: 649*0.375,
        width: 844*0.375,
      },
    }];
      return(
        <View>
          <AppIntro
            onNextBtnClick={this.nextBtnHandle}
            onDoneBtnClick={this.doneBtnHandle}
            onSkipBtnClick={this.onSkipBtnHandle}
            onSlideChange={this.onSlideChangeHandle}
            pageArray={pageArray}
            />
        </View>
      )
  }
}

export default connect(null, boundActions)(TutorialScreen);