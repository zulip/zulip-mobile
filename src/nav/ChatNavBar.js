/* @flow strict-local */
import { connect } from 'react-redux';

import React, { PureComponent } from 'react';
import { View } from 'react-native';

import type { Dispatch, Context, GlobalState, Narrow } from '../types';
import { BRAND_COLOR } from '../styles';
import Title from '../title/Title';
import NavButton from './NavButton';
import TitleNavButtons from '../title-buttons/TitleNavButtons';
import { DEFAULT_TITLE_BACKGROUND_COLOR, getTitleBackgroundColor } from '../title/titleSelectors';
import { foregroundColorFromBackground } from '../utils/color';
import { navigateBack } from '../actions';

type Props = {|
  dispatch: Dispatch,
  backgroundColor: string,
  narrow: Narrow,
  cancelEditMode: ?() => void,
|};

class ChatNavBar extends PureComponent<Props> {
  context: Context;

  static contextTypes = {
    styles: () => null,
  };

  handlePress = (): void => {
    const { dispatch, cancelEditMode } = this.props;
    if (cancelEditMode) {
      cancelEditMode();
      return;
    }
    dispatch(navigateBack());
  };

  render() {
    const { styles } = this.context;
    const { backgroundColor, cancelEditMode, narrow } = this.props;
    const color =
      backgroundColor === DEFAULT_TITLE_BACKGROUND_COLOR
        ? BRAND_COLOR
        : foregroundColorFromBackground(backgroundColor);

    return (
      <View style={[styles.navBar, { backgroundColor }]}>
        <NavButton name="arrow-left" color={color} onPress={this.handlePress} />
        <Title color={color} narrow={narrow} isEditMode={!!cancelEditMode} />
        <TitleNavButtons color={color} narrow={narrow} />
      </View>
    );
  }
}

export default connect((state: GlobalState, props) => ({
  backgroundColor: getTitleBackgroundColor(props.narrow)(state),
}))(ChatNavBar);
