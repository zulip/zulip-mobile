/* @flow */
import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { StyleSheet, View } from 'react-native';

import type { Actions, Narrow, Stream } from '../types';
import boundActions from '../boundActions';
import { ZulipStatusBar } from '../common';
import { BRAND_COLOR } from '../styles';
import { isStreamNarrow, isTopicNarrow } from '../utils/narrow';
import Title from '../title/Title';
import NavButton from './NavButton';
import { getActiveNarrow, getSubscriptions, getUnreadPrivateMessagesCount } from '../selectors';
import { foregroundColorFromBackground } from '../utils/color';
import { NULL_SUBSCRIPTION } from '../nullObjects';

class MainNavBar extends PureComponent {
  static contextTypes = {
    styles: () => null,
  };

  props: {
    actions: Actions,
    narrow: Narrow,
    editMessage: boolean,
    subscriptions: Stream[],
    unreadPrivateMessagesCount: number,
    onPressPeople: () => void,
    onPressStreams: () => void,
  };

  render() {
    const { styles } = this.context;
    const {
      actions,
      narrow,
      subscriptions,
      unreadPrivateMessagesCount,
      onPressStreams,
      onPressPeople,
      editMessage,
    } = this.props;
    const leftPress = editMessage ? actions.cancelEditMessage : onPressStreams;
    const flattenStyle = StyleSheet.flatten(styles.navBar);
    const backgroundColor =
      isStreamNarrow(narrow) || isTopicNarrow(narrow)
        ? (subscriptions.find(sub => narrow[0].operand === sub.name) || NULL_SUBSCRIPTION).color
        : flattenStyle ? flattenStyle.backgroundColor : undefined;

    const textColor =
      backgroundColor && (isStreamNarrow(narrow) || isTopicNarrow(narrow))
        ? foregroundColorFromBackground(backgroundColor)
        : BRAND_COLOR;

    return (
      <View style={[styles.navBar, { backgroundColor }]}>
        <ZulipStatusBar backgroundColor={backgroundColor} />
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
    );
  }
}

export default connect(
  state => ({
    narrow: getActiveNarrow(state),
    subscriptions: getSubscriptions(state),
    unreadPrivateMessagesCount: getUnreadPrivateMessagesCount(state),
    editMessage: state.app.editMessage,
  }),
  boundActions,
)(MainNavBar);
