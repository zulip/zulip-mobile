/* @flow */
import React, { PureComponent } from 'react';
import { View } from 'react-native';

import type { Actions } from '../types';
import connectWithActions from '../connectWithActions';
import Title from '../title/Title';
import NavButton from './NavButton';
import NavButtonPlaceholder from './NavButtonPlaceholder';
import { getTitleBackgroundColor, getTitleTextColor } from '../selectors';

type Props = {
  actions: Actions,
  textColor: string,
  editMessage: boolean,
  backgroundColor: string,
  unreadMentionsTotal: number,
  onPressStreams: () => void,
};

class ChatNavBar extends PureComponent<Props> {
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
          name={editMessage ? 'md-arrow-back' : 'ios-menu'}
          color={textColor}
          showCircle={unreadMentionsTotal > 0}
          onPress={leftPress}
        />
        <Title color={textColor} />
        <NavButtonPlaceholder />
      </View>
    );
  }
}

export default connectWithActions((state, props) => ({
  backgroundColor: getTitleBackgroundColor(props.narrow)(state),
  textColor: getTitleTextColor(props.narrow)(state),
}))(ChatNavBar);
