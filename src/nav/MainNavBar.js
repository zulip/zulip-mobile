/* @flow */
import React, { PureComponent } from 'react';
import { View } from 'react-native';

import type { Actions, Narrow } from '../types';
import connectWithActions from '../connectWithActions';
import { ViewPlaceholder } from '../common';
import Title from '../title/Title';
import NavButton from './NavButton';
import TitleNavButtons from '../title-buttons/TitleNavButtons';
import {
  getSession,
  getShowBackArrow,
  getUnreadPmsTotal,
  getUnreadHuddlesTotal,
  getUnreadMentionsTotal,
  getTitleBackgroundColor,
  getTitleTextColor,
} from '../selectors';

type Props = {
  actions: Actions,
  backgroundColor: string,
  narrow: Narrow,
  showBackArrow: boolean,
  textColor: string,
};

class MainNavBar extends PureComponent<Props> {
  static contextTypes = {
    styles: () => null,
  };

  props: Props;

  render() {
    const { styles } = this.context;
    const { actions, backgroundColor, narrow, showBackArrow, textColor } = this.props;

    return (
      <View style={[styles.navBar, { backgroundColor }]}>
        {showBackArrow && (
          <NavButton name="arrow-left" color={textColor} onPress={actions.navigateBack} />
        )}
        <ViewPlaceholder width={8} />
        <Title color={textColor} narrow={narrow} />
        <TitleNavButtons narrow={narrow} />
      </View>
    );
  }
}

export default connectWithActions((state, props) => ({
  backgroundColor: getTitleBackgroundColor(props.narrow)(state),
  showBackArrow: getShowBackArrow(state),
  textColor: getTitleTextColor(props.narrow)(state),
  unreadHuddlesTotal: getUnreadHuddlesTotal(state),
  unreadMentionsTotal: getUnreadMentionsTotal(state),
  unreadPmsTotal: getUnreadPmsTotal(state),
  editMessage: getSession(state).editMessage,
}))(MainNavBar);
