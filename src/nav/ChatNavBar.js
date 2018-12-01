/* @flow strict-local */
import { connect } from 'react-redux';

import React, { PureComponent } from 'react';
import { View } from 'react-native';

import type { Dispatch, Context, GlobalState, Narrow } from '../types';
import { BRAND_COLOR } from '../styles';
import Title from '../title/Title';
import NavButton from './NavButton';
import TitleNavButtons from '../title-buttons/TitleNavButtons';
import { getCanGoBack } from '../selectors';
import { DEFAULT_TITLE_BACKGROUND_COLOR, getTitleBackgroundColor } from '../title/titleSelectors';
import { foregroundColorFromBackground } from '../utils/color';
import { connectPreserveOnBackOption } from '../utils/redux';
import { navigateBack } from '../actions';

type Props = {
  dispatch: Dispatch,
  backgroundColor: string,
  canGoBack: boolean,
  narrow: Narrow,
};

class ChatNavBar extends PureComponent<Props> {
  context: Context;
  props: Props;

  static contextTypes = {
    styles: () => null,
  };

  render() {
    const { styles } = this.context;
    const { dispatch, backgroundColor, canGoBack, narrow } = this.props;
    const color =
      backgroundColor === DEFAULT_TITLE_BACKGROUND_COLOR
        ? BRAND_COLOR
        : foregroundColorFromBackground(backgroundColor);

    return (
      <View style={[styles.navBar, { backgroundColor }]}>
        {canGoBack && (
          <NavButton
            name="arrow-left"
            color={color}
            onPress={() => {
              dispatch(navigateBack());
            }}
          />
        )}
        <Title color={color} narrow={narrow} />
        <TitleNavButtons color={color} narrow={narrow} />
      </View>
    );
  }
}

export default connect(
  (state: GlobalState, props) => ({
    backgroundColor: getTitleBackgroundColor(props.narrow)(state),
    canGoBack: getCanGoBack(state),
  }),
  null,
  null,
  connectPreserveOnBackOption,
)(ChatNavBar);
