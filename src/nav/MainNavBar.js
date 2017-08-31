/* @flow */
import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { View } from 'react-native';

import type { Actions } from '../types';
import boundActions from '../boundActions';
import { ZulipStatusBar, Touchable } from '../common';
import Title from '../title/Title';
import NavButton from './NavButton';
import { homeNarrow, isHomeNarrow } from '../utils/narrow';
import {
  getUnreadPmsTotal,
  getUnreadHuddlesTotal,
  getUnreadMentionsTotal,
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
    unreadMentionsTotal: number,
    onPressStreams: () => void,
  };

  render() {
    const { styles } = this.context;
    const {
      actions,
      narrow,
      backgroundColor,
      textColor,
      unreadMentionsTotal,
      onPressStreams,
      editMessage,
    } = this.props;

    const leftPress = editMessage ? actions.cancelEditMessage : onPressStreams;

    return (
      <View style={[styles.navBar, { backgroundColor }]}>
        <ZulipStatusBar backgroundColor={backgroundColor} />
        {isHomeNarrow(narrow)
          ? <NavButton placeholder />
          : <NavButton
              name={'md-arrow-back'}
              color={textColor}
              showCircle={unreadMentionsTotal > 0}
              onPress={() => actions.doNarrow(homeNarrow)}
            />}
        <Touchable onPress={leftPress}>
          <Title color={textColor} />
        </Touchable>
        <NavButton placeholder />
      </View>
    );
  }
}

export default connect(
  state => ({
    backgroundColor: getTitleBackgroundColor(state),
    textColor: getTitleTextColor(state),
    unreadHuddlesTotal: getUnreadHuddlesTotal(state),
    unreadMentionsTotal: getUnreadMentionsTotal(state),
    unreadPmsTotal: getUnreadPmsTotal(state),
    editMessage: state.app.editMessage,
  }),
  boundActions,
)(MainNavBar);
