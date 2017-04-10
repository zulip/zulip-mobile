import React from 'react';
import { connect } from 'react-redux';
import { StyleSheet, View } from 'react-native';

import { styles, ZulipStatusBar } from '../common';
import { BRAND_COLOR } from '../common/styles';
import { isStreamNarrow, isTopicNarrow } from '../utils/narrow';
import Title from '../title/Title';
import NavButton from './NavButton';
import { getUnreadPrivateMessagesCount } from '../chat/chatSelectors';
import { foregroundColorFromBackground } from '../utils/color';

const moreStyles = StyleSheet.create({
  wrapper: {
    flex: 1,
    flexDirection: 'column',
  },
});

class MainNavBar extends React.Component {
  render() {
    const { narrow, noStatusBar, subscriptions, unreadPrivateMessagesCount,
      onPressStreams, onPressPeople } = this.props;

    const backgroundColor = isStreamNarrow(narrow) || isTopicNarrow(narrow) ?
      (subscriptions.find((sub) => narrow[0].operand === sub.name)).color :
      'white';

    const textColor = isStreamNarrow(narrow) || isTopicNarrow(narrow) ?
      foregroundColorFromBackground(backgroundColor) :
      BRAND_COLOR;

    return (
      <View style={moreStyles.wrapper}>
        <ZulipStatusBar
          hidden={noStatusBar}
          backgroundColor={backgroundColor}
        />
        <View style={[styles.navBar, { backgroundColor }]}>
          <NavButton name="ios-menu" color={textColor} onPress={onPressStreams} />
          <Title color={textColor} />
          <NavButton
            name="md-people"
            color={textColor}
            showCircle={unreadPrivateMessagesCount > 0}
            onPress={onPressPeople}
          />
        </View>
        {this.props.children}
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
