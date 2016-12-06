import React from 'react';
import {
  View,
} from 'react-native';
import { connect } from 'react-redux';

import TitleSpecial from './TitleSpecial';
import TitleStream from './TitleStream';
import TitleTopic from './TitleTopic';
import TitleGroup from './TitleGroup';
import TitlePrivate from './TitlePrivate';

class Title extends React.PureComponent {
  render() {
    return (
      <View>
        <TitleSpecial />
        <TitleStream />
        <TitleTopic />
        <TitleGroup />
        <TitlePrivate />
      </View>
    );
  }
}

export default connect(
  (state) => ({
    narrow: state.chat.narrow,
  })
)(Title);
