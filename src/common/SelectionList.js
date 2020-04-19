/* @flow strict-local */
import React, { PureComponent } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import type { ViewStyleProp } from 'react-native/Libraries/StyleSheet/StyleSheet';
import type { NavigationScreenProp } from 'react-navigation';

import type { Dispatch } from '../types';
import type { ThemeColors } from '../styles';
import { connect } from '../react-redux';
import Label from './Label';
import { IconDone, IconRight } from './Icons';
import Touchable from './Touchable';
import { BRAND_COLOR, ThemeContext } from '../styles';
import { navigateToZulipPickerOptionsScreen, navigateBack } from '../nav/navActions';
import OptionDivider from './OptionDivider';
import Screen from './Screen';

const componentStyles = StyleSheet.create({
  selectorWrapper: {
    marginTop: 4,
  },
  selectorRow: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  selectorValue: {
    color: 'gray',
    marginTop: 4,
  },
  selectorIcon: {
    alignSelf: 'center',
  },
  selectorLabel: {
    fontWeight: '400',
  },
  optionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 12,
    paddingLeft: 16,
    paddingRight: 16,
  },
  optionSelectedValue: { color: BRAND_COLOR },
});

type OptionsScreenProps = $ReadOnly<{|
  dispatch: Dispatch,
  navigation: NavigationScreenProp<{
    params: {|
      label: string,
      options: $ReadOnlyArray<{| key: number, value: string |}>,
      selectedIndex: number,
      onOptionSelect: (value: number) => void,
    |},
  }>,
|}>;

/**
 * A selector option list component.
 *
 * @prop label - label for selectionl list.
 * @prop options - all available options to select from.
 * @prop selectedIndex - index of currently selected option.
 * @prop onOptionSelect - Event called when any option is selected.
 */
class OptionsScreen extends PureComponent<OptionsScreenProps> {
  onOptionSelect = (index: number) => {
    const { dispatch, navigation } = this.props;
    const { onOptionSelect } = navigation.state.params;
    onOptionSelect(index);
    dispatch(navigateBack());
  };

  render() {
    const { label, options, selectedIndex } = this.props.navigation.state.params;

    return (
      <Screen title={label}>
        <FlatList
          ItemSeparatorComponent={OptionDivider}
          data={options}
          keyExtractor={item => `${item.key}`}
          renderItem={({ item, index }) => (
            <Touchable onPress={() => this.onOptionSelect(index)}>
              <View style={componentStyles.optionItem}>
                <Label
                  style={selectedIndex === index && componentStyles.optionSelectedValue}
                  text={item.value}
                />
                {selectedIndex === index && <IconDone size={16} color={BRAND_COLOR} />}
              </View>
            </Touchable>
          )}
        />
      </Screen>
    );
  }
}

type SelectorProps = $ReadOnly<{|
  dispatch: Dispatch,
  label: string,
  options: $ReadOnlyArray<{| key: number, value: string |}>,
  selectedIndex: number,
  style?: ViewStyleProp,
  onOptionSelect: (value: number) => void,
|}>;

/**
 * An selector component, which shows the the label and selected value
 *
 * @prop [style] - Style object applied to the outermost component.
 * @prop label - label of the picker.
 * @prop options - all available options to select from.
 * @prop selectedIndex - index of currently selected option.
 * @prop onOptionSelect - Event called when any option is selected.
 */
class Selector extends PureComponent<SelectorProps> {
  static contextType = ThemeContext;
  context: ThemeColors;

  styles = { icon: { color: this.context.color } };

  navigateToZulipPickerOptions = () => {
    const { dispatch, options, label, selectedIndex, onOptionSelect } = this.props;
    dispatch(navigateToZulipPickerOptionsScreen(label, options, selectedIndex, onOptionSelect));
  };

  render() {
    const { label, options, selectedIndex, style } = this.props;

    return (
      <Touchable
        style={[style, componentStyles.selectorWrapper]}
        onPress={this.navigateToZulipPickerOptions}
      >
        <View style={componentStyles.selectorRow}>
          <View>
            <Label style={componentStyles.selectorLabel} text={label} />
            <Label style={componentStyles.selectorValue} text={options[selectedIndex].value} />
          </View>
          <IconRight size={24} style={[this.styles.icon, componentStyles.selectorIcon]} />
        </View>
      </Touchable>
    );
  }
}

export default {
  Selector: connect()(Selector),
  OptionsScreen: connect()(OptionsScreen),
};
