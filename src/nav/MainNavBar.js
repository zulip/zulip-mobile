/* @flow */
import React from 'react';
import { connect } from 'react-redux';
import { StyleSheet, View } from 'react-native';

import { ZulipStatusBar } from '../common';
import { BRAND_COLOR } from '../styles';
import { isStreamNarrow, isTopicNarrow } from '../utils/narrow';
import Title from '../title/Title';
import NavButton from './NavButton';
import { getUnreadPrivateMessagesCount } from '../chat/chatSelectors';
import { foregroundColorFromBackground } from '../utils/color';
import { NULL_SUBSCRIPTION } from '../nullObjects';

const componentStyles = StyleSheet.create({
  wrapper: {
    flex: 1,
    flexDirection: 'column',
  },
});

class MainNavBar extends React.Component {
  static contextTypes = {
    styles: () => null,
  };

  render() {
    const { styles } = this.context;
    const {
      narrow,
      subscriptions,
      unreadPrivateMessagesCount,
      onPressStreams,
      onPressPeople,
      cancelEditMessage,
      editMessage,
    } = this.props;
    const leftPress = editMessage ? cancelEditMessage : onPressStreams;
    const backgroundColor =
      isStreamNarrow(narrow) || isTopicNarrow(narrow)
        ? (subscriptions.find(sub => narrow[0].operand === sub.name) || NULL_SUBSCRIPTION).color
        : StyleSheet.flatten(styles.navBar).backgroundColor;

    const textColor =
      isStreamNarrow(narrow) || isTopicNarrow(narrow)
        ? foregroundColorFromBackground(backgroundColor)
        : BRAND_COLOR;

    return (
      <View style={componentStyles.wrapper}>
        <ZulipStatusBar backgroundColor={backgroundColor} />
        <View style={[styles.navBar, { backgroundColor }]}>
          <NavButton
            name={editMessage ? 'md-arrow-back' : 'ios-menu'}
            color={textColor}
            onPress={leftPress}
          />
          <Title color={textColor} />
          {!editMessage &&
            <NavButton
              name="md-people"
              color={textColor}
              showCircle={unreadPrivateMessagesCount > 0}
              onPress={onPressPeople}
            />}
        </View>
        {this.props.children}
      </View>
    );
  }
}

export default connect(state => ({
  narrow: state.chat.narrow,
  subscriptions: state.subscriptions,
  unreadPrivateMessagesCount: getUnreadPrivateMessagesCount(state),
  editMessage: state.app.editMessage,
}))(MainNavBar);
