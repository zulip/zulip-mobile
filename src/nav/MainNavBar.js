/* @flow */
import React, { PureComponent } from 'react';
import { View } from 'react-native';

import type { Actions } from '../types';
import connectWithActions from '../connectWithActions';
import Title from '../title/Title';
import NavButton from './NavButton';
import InfoNavButton from '../title/InfoNavButton';
import {
  getApp,
  getCanGoBack,
  getUnreadPmsTotal,
  getUnreadHuddlesTotal,
  getUnreadMentionsTotal,
  getTitleBackgroundColor,
  getTitleTextColor,
} from '../selectors';

type Props = {
  actions: Actions,
  canGoBack: boolean,
  textColor: string,
  backgroundColor: string,
};

class MainNavBar extends PureComponent<Props> {
  static contextTypes = {
    styles: () => null,
  };

  props: Props;

  render() {
    const { styles } = this.context;
    const { actions, backgroundColor, canGoBack, textColor } = this.props;

    return (
      <View style={[styles.navBar, { backgroundColor }]}>
        {canGoBack && (
          <NavButton name="arrow-left" color={textColor} onPress={actions.navigateBack} />
        )}
        <Title color={textColor} />
        <InfoNavButton />
      </View>
    );
  }
}

export default connectWithActions(state => ({
  backgroundColor: getTitleBackgroundColor(state),
  canGoBack: getCanGoBack(state),
  textColor: getTitleTextColor(state),
  unreadHuddlesTotal: getUnreadHuddlesTotal(state),
  unreadMentionsTotal: getUnreadMentionsTotal(state),
  unreadPmsTotal: getUnreadPmsTotal(state),
  editMessage: getApp(state).editMessage,
}))(MainNavBar);
