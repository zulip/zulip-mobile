/* @flow */
import React, { PureComponent } from 'react';
import { View } from 'react-native';

import type { Actions } from '../types';
import connectWithActions from '../connectWithActions';
import Title from '../title/Title';
import NavButton from './NavButton';
import InfoNavButton from '../title/InfoNavButton';
import {
  getUnreadPmsTotal,
  getUnreadHuddlesTotal,
  getUnreadMentionsTotal,
  getTitleBackgroundColor,
  getTitleTextColor,
} from '../selectors';

type Props = {
  actions: Actions,
  textColor: string,
  editMessage: boolean,
  backgroundColor: string,
  unreadMentionsTotal: number,
  onPressStreams: () => void,
};

class MainNavBar extends PureComponent<Props> {
  static contextTypes = {
    styles: () => null,
  };

  props: Props;

  render() {
    const { styles } = this.context;
    const {
      actions,
      backgroundColor,
      textColor,
      unreadMentionsTotal,
      onPressStreams,
      editMessage,
    } = this.props;

    const leftPress = editMessage ? actions.cancelEditMessage : onPressStreams;

    return (
      <View style={[styles.navBar, { backgroundColor }]}>
        <NavButton
          name={editMessage ? 'arrow-left' : 'menu'}
          color={textColor}
          showCircle={unreadMentionsTotal > 0}
          onPress={leftPress}
        />
        <Title color={textColor} />
        <InfoNavButton />
      </View>
    );
  }
}

export default connectWithActions(state => ({
  backgroundColor: getTitleBackgroundColor(state),
  textColor: getTitleTextColor(state),
  unreadHuddlesTotal: getUnreadHuddlesTotal(state),
  unreadMentionsTotal: getUnreadMentionsTotal(state),
  unreadPmsTotal: getUnreadPmsTotal(state),
  editMessage: state.app.editMessage,
}))(MainNavBar);
