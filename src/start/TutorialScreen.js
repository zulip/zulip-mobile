import React, { Component } from 'react';
import { connect } from 'react-redux';
import boundActions from '../boundActions';
import { Text, View, Image, StyleSheet } from 'react-native';

import AppIntro from 'react-native-app-intro';

const styles = StyleSheet.create({
  
});

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
      title: 'Welcome!',
      description: 'Welcome to Zulip!',
      backgroundColor: '#fa931d',
      fontColor: '#fff',
      level: 10,
    }, {
      title: 'Group Messaging',
      description: 'An open source cross platform group messaging app',
      backgroundColor: '#a4b602',
      fontColor: '#fff',
      level: 10,
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