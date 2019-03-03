/* @flow strict-local */
import { connect } from 'react-redux';

import React, { PureComponent } from 'react';
import { StyleSheet, View } from 'react-native';

import type { Dispatch, GlobalState, Narrow } from '../types';
import styles, { BRAND_COLOR } from '../styles';
import Title from '../title/Title';
import NavButton from './NavButton';
import TitleNavButtons from '../title-buttons/TitleNavButtons';
import { DEFAULT_TITLE_BACKGROUND_COLOR, getTitleBackgroundColor } from '../title/titleSelectors';
import { foregroundColorFromBackground } from '../utils/color';
import { navigateBack } from '../actions';

const componentStyles = StyleSheet.create({
  navContent: {
    flex: 1,
    justifyContent: 'space-between',
    flexDirection: 'row',
    alignItems: 'center',
  },
});

type Props = {|
  dispatch: Dispatch,
  backgroundColor: string,
  narrow: Narrow,
|};

class ChatNavBar extends PureComponent<Props> {
  render() {
    const { dispatch, backgroundColor, narrow } = this.props;
    const color =
      backgroundColor === DEFAULT_TITLE_BACKGROUND_COLOR
        ? BRAND_COLOR
        : foregroundColorFromBackground(backgroundColor);

    return (
      <View style={[styles.navBar, { backgroundColor }]}>
        <NavButton
          name="arrow-left"
          color={color}
          onPress={() => {
            dispatch(navigateBack());
          }}
        />
        <View style={componentStyles.navContent}>
          <Title color={color} narrow={narrow} />
          <TitleNavButtons color={color} narrow={narrow} />
        </View>
      </View>
    );
  }
}

export default connect((state: GlobalState, props) => ({
  backgroundColor: getTitleBackgroundColor(props.narrow)(state),
}))(ChatNavBar);
