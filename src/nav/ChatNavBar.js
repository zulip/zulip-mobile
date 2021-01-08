/* @flow strict-local */

import React, { PureComponent } from 'react';
import { View } from 'react-native';
import Color from 'color';

import * as NavigationService from './NavigationService';
import type { Dispatch, Narrow, EditMessage } from '../types';
import { LoadingBanner } from '../common';
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
  editMessage: EditMessage | null,

  dispatch: Dispatch,
  ...SelectorProps,
|}>;

class ChatNavBar extends PureComponent<Props> {
  render() {
    const { backgroundColor, narrow, editMessage } = this.props;
    const color =
      backgroundColor === DEFAULT_TITLE_BACKGROUND_COLOR
        ? BRAND_COLOR
        : foregroundColorFromBackground(backgroundColor);
    const spinnerColor =
      backgroundColor === DEFAULT_TITLE_BACKGROUND_COLOR
        ? 'default'
        : foregroundColorFromBackground(backgroundColor);

    return (
      <View
        style={{
          borderColor:
            backgroundColor === 'transparent'
              ? 'hsla(0, 0%, 50%, 0.25)'
              : Color(backgroundColor).darken(0.1),
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
            accessibilityLabel="Navigate up"
            color={color}
            onPress={() => {
              NavigationService.dispatch(navigateBack());
            }}
          />
          <Title color={color} narrow={narrow} editMessage={editMessage} />
          <ExtraButton color={color} narrow={narrow} />
          <InfoButton color={color} narrow={narrow} />
        </View>
        <LoadingBanner
          spinnerColor={spinnerColor}
          backgroundColor={backgroundColor}
          textColor={color}
        />
      </View>
    );
  }
}

export default connect<SelectorProps, _, _>((state, props) => ({
  backgroundColor: getTitleBackgroundColor(state, props.narrow),
}))(ChatNavBar);
