/* @flow */
import React, { PureComponent } from 'react';
import { View } from 'react-native';

import type { Actions, Narrow } from '../types';
import connectWithActions from '../connectWithActions';
import Title from '../title/Title';
import NavButton from './NavButton';
import InfoNavButton from '../title/InfoNavButton';
import {
  getActiveNarrow,
  getUnreadPmsTotal,
  getUnreadHuddlesTotal,
  getUnreadMentionsTotal,
  getTitleBackgroundColor,
  getTitleTextColor,
} from '../selectors';
import { isHomeNarrow, navigateBackFromNarrow } from '../utils/narrow';

type Props = {
  actions: Actions,
  textColor: string,
  editMessage: boolean,
  backgroundColor: string,
  unreadMentionsTotal: number,
  narrow: Narrow,
  openDrawer: () => void,
};

class MainNavBar extends PureComponent<Props> {
  props: Props;

  static contextTypes = {
    styles: () => null,
  };

  selectLeftIcon = () => {
    const { narrow, editMessage } = this.props;
    return editMessage || !isHomeNarrow(narrow) ? 'arrow-left' : 'menu';
  };

  onLeftPress = () => {
    const { actions, editMessage, narrow, openDrawer } = this.props;

    if (editMessage) {
      return actions.cancelEditMessage;
    } else if (!isHomeNarrow(narrow)) {
      return () => actions.doNarrow(navigateBackFromNarrow());
    }
    return openDrawer;
  };

  render() {
    const { styles } = this.context;
    const { backgroundColor, textColor, unreadMentionsTotal } = this.props;

    return (
      <View style={[styles.navBar, { backgroundColor }]}>
        <NavButton
          name={this.selectLeftIcon()}
          color={textColor}
          showCircle={unreadMentionsTotal > 0}
          onPress={this.onLeftPress()}
        />
        <Title color={textColor} />
        <InfoNavButton />
      </View>
    );
  }
}

export default connectWithActions(state => ({
  backgroundColor: getTitleBackgroundColor(state),
  narrow: getActiveNarrow(state),
  textColor: getTitleTextColor(state),
  unreadHuddlesTotal: getUnreadHuddlesTotal(state),
  unreadMentionsTotal: getUnreadMentionsTotal(state),
  unreadPmsTotal: getUnreadPmsTotal(state),
  editMessage: state.app.editMessage,
}))(MainNavBar);
