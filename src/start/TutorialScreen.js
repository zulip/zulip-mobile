import React, { Component } from 'react';
import { connect } from 'react-redux';
import { View } from 'react-native';
import AppIntro from 'react-native-app-intro';
import boundActions from '../boundActions';
import { tutorialPages } from '../tutorial/TutorialPages';

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
    return (
      <View>
        <AppIntro
          onNextBtnClick={this.nextBtnHandle}
          onDoneBtnClick={this.doneBtnHandle}
          onSkipBtnClick={this.onSkipBtnHandle}
          onSlideChange={this.onSlideChangeHandle}
          pageArray={tutorialPages}
        />
      </View>
    );
  }
}

export default connect(null, boundActions)(TutorialScreen);
