import React from 'react';
import { connect } from 'react-redux';
import { StyleSheet, View } from 'react-native';

import { ZulipStatusBar } from '../common';
import styles, { BRAND_COLOR } from '../styles';
import { isStreamNarrow, isTopicNarrow, homeNarrow } from '../utils/narrow';
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
    const { narrow, subscriptions, unreadPrivateMessagesCount,
      onPressStreams, onPressPeople, onNarrow, streams } = this.props;

    if ((isStreamNarrow(narrow) || isTopicNarrow(narrow)) &&
      !streams.find((sub) => narrow[0].operand === sub.name)) {
      // narrow in the cache has became outdated
      onNarrow(homeNarrow());
    }

    const currentStream = (isStreamNarrow(narrow) || isTopicNarrow(narrow)) &&
      subscriptions.find((sub) => narrow[0].operand === sub.name);
    let backgroundColor = 'white';
    let textColor = BRAND_COLOR;

    if (!currentStream && (isStreamNarrow(narrow) || isTopicNarrow(narrow))) {
      // current stream is not subscribed
      backgroundColor = 'gray';
      textColor = 'white';
    } else if (isStreamNarrow(narrow) || isTopicNarrow(narrow)) {
      backgroundColor = currentStream.color;
      textColor = foregroundColorFromBackground(backgroundColor);
    }

    return (
      <View style={moreStyles.wrapper}>
        <ZulipStatusBar
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
    streams: state.streams,
    unreadPrivateMessagesCount: getUnreadPrivateMessagesCount(state),
  })
)(MainNavBar);
