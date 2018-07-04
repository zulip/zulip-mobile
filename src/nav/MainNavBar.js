/* @flow */
import { connect } from 'react-redux';

import React, { PureComponent } from 'react';
import { View } from 'react-native';

import type { Context, GlobalState, Narrow } from '../types';
import Title from '../title/Title';
import BackButton from './BackButton';
import TitleNavButtons from '../title-buttons/TitleNavButtons';
import { getCanGoBack, getTitleBackgroundColor, getTitleTextColor } from '../selectors';
import { connectPreserveOnBackOption } from '../utils/redux';

type Props = {
  backgroundColor: string,
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
    const { backgroundColor, narrow, textColor } = this.props;

    return (
      <View style={[styles.navBar, { backgroundColor }]}>
        <BackButton color={textColor} />
        <Title color={textColor} narrow={narrow} />
        <TitleNavButtons narrow={narrow} />
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
