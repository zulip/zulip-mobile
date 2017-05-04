import React from 'react';
import { connect } from 'react-redux';
import { View } from 'react-native';

import { ZulipStatusBar } from '../common';
import styles, { BRAND_COLOR } from '../styles';
import { isStreamNarrow, isTopicNarrow } from '../utils/narrow';
import Title from '../title/Title';
import NavButton from './NavButton';
import { getUnreadPrivateMessagesCount } from '../chat/chatSelectors';
import { foregroundColorFromBackground } from '../utils/color';

class MainNavBar extends React.Component {

  render() {
    const { narrow, subscriptions, unreadPrivateMessagesCount,
      onPressStreams, onPressPeople } = this.props;

    const backgroundColor = isStreamNarrow(narrow) || isTopicNarrow(narrow) ?
      (subscriptions.find((sub) => narrow[0].operand === sub.name)).color :
      styles.navBar.backgroundColor;

    const textColor = isStreamNarrow(narrow) || isTopicNarrow(narrow) ?
      foregroundColorFromBackground(backgroundColor) :
      BRAND_COLOR;

    return (
      <View style={[styles.navBar, { backgroundColor }]}>
        <ZulipStatusBar
          backgroundColor={backgroundColor}
        />
        <NavButton name="ios-menu" color={textColor} onPress={onPressStreams} />
        <Title color={textColor} />
        <NavButton
          name="md-people"
          color={textColor}
          showCircle={unreadPrivateMessagesCount > 0}
          onPress={onPressPeople}
        />
      </View>
    );
  }
}

export default connect(
  (state) => ({
    narrow: state.chat.narrow,
    subscriptions: state.subscriptions,
    unreadPrivateMessagesCount: getUnreadPrivateMessagesCount(state),
  })
)(MainNavBar);
