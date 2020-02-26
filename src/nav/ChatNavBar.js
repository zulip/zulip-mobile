/* @flow strict-local */

import React, { PureComponent } from 'react';
import { View } from 'react-native';

import type { Dispatch, Narrow } from '../types';
import { connect } from '../react-redux';
import { BRAND_COLOR, NAVBAR_SIZE } from '../styles';
import Title from '../title/Title';
import NavButton from './NavButton';
import { DEFAULT_TITLE_BACKGROUND_COLOR, getTitleBackgroundColor } from '../title/titleSelectors';
import { foregroundColorFromBackground } from '../utils/color';
import { navigateBack } from '../actions';
import { ExtraButton, InfoButton } from '../title-buttons/titleButtonFromNarrow';

type SelectorProps = {|
  backgroundColor: string,
|};

type Props = $ReadOnly<{|
  narrow: Narrow,

  dispatch: Dispatch,
  ...SelectorProps,
|}>;

class ChatNavBar extends PureComponent<Props> {
  render() {
    const { dispatch, backgroundColor, narrow } = this.props;
    const color =
      backgroundColor === DEFAULT_TITLE_BACKGROUND_COLOR
        ? BRAND_COLOR
        : foregroundColorFromBackground(backgroundColor);

    return (
      <View
        style={{
          borderColor: 'hsla(0, 0%, 50%, 0.25)',
          borderBottomWidth: 1,
        }}
      >
        <View
          style={[
            {
              flexDirection: 'row',
              height: NAVBAR_SIZE,
              alignItems: 'center',
            },
            { backgroundColor },
          ]}
        >
          <NavButton
            name="arrow-left"
            color={color}
            onPress={() => {
              dispatch(navigateBack());
            }}
          />
          <Title color={color} narrow={narrow} />
          <ExtraButton color={color} narrow={narrow} />
          <InfoButton color={color} narrow={narrow} />
        </View>
      </View>
    );
  }
}

export default connect<SelectorProps, _, _>((state, props) => ({
  backgroundColor: getTitleBackgroundColor(state, props.narrow),
}))(ChatNavBar);
