/* @flow */
import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { View } from 'react-native';

import type { Actions } from '../types';
import boundActions from '../boundActions';
import { ZulipStatusBar } from '../common';
import Title from '../title/Title';
import NavButton from './NavButton';
import {
  getUnreadPrivateMessagesCount,
  getTitleBackgroundColor,
  getTitleTextColor,
} from '../selectors';

class MainNavBar extends PureComponent {
  static contextTypes = {
    styles: () => null,
  };

  props: {
    actions: Actions,
    backgroundColor: string,
    textColor: string,
    editMessage: boolean,
    unreadPrivateMessagesCount: number,
    onPressPeople: () => void,
    onPressStreams: () => void,
  };

  render() {
    const { styles } = this.context;
    const {
      actions,
      backgroundColor,
      textColor,
      unreadPrivateMessagesCount,
      onPressStreams,
      onPressPeople,
      editMessage,
    } = this.props;
    const leftPress = editMessage ? actions.cancelEditMessage : onPressStreams;

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
    backgroundColor: getTitleBackgroundColor(state),
    textColor: getTitleTextColor(state),
    unreadPrivateMessagesCount: getUnreadPrivateMessagesCount(state),
    editMessage: state.app.editMessage,
  }),
  boundActions,
)(MainNavBar);
