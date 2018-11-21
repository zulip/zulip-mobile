/* @flow */
import { connect } from 'react-redux';

import React, { PureComponent } from 'react';
import { View } from 'react-native';

import type { Dispatch, Context, GlobalState, Narrow } from '../types';
import Title from '../title/Title';
import NavButton from './NavButton';
import TitleNavButtons from '../title-buttons/TitleNavButtons';
import { getCanGoBack, getTitleBackgroundColor, getTitleTextColor } from '../selectors';
import { connectPreserveOnBackOption } from '../utils/redux';
import { navigateBack } from '../actions';

type Props = {
  dispatch: Dispatch,
  backgroundColor: string,
  canGoBack: boolean,
  narrow: Narrow,
  textColor: string,
};

class MainNavBar extends PureComponent<Props> {
  context: Context;
  props: Props;

  static contextTypes = {
    styles: () => null,
  };

  render() {
    const { styles } = this.context;
    const { dispatch, backgroundColor, canGoBack, narrow, textColor } = this.props;

    return (
      <View style={[styles.navBar, { backgroundColor }]}>
        {canGoBack && (
          <NavButton
            name="arrow-left"
            color={textColor}
            onPress={() => {
              dispatch(navigateBack());
            }}
          />
        )}
        <Title color={textColor} narrow={narrow} />
        <TitleNavButtons color={textColor} narrow={narrow} />
      </View>
    );
  }
}

export default connect(
  (state: GlobalState, props) => ({
    backgroundColor: getTitleBackgroundColor(props.narrow)(state),
    canGoBack: getCanGoBack(state),
    textColor: getTitleTextColor(props.narrow)(state),
  }),
  null,
  null,
  connectPreserveOnBackOption,
)(MainNavBar);
