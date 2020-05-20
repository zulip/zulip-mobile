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
import { navigateToSelectionListOptionsScreen } from '../nav/navActions';
import OptionDivider from './OptionDivider';
import Screen from './Screen';

export type SelectionOptions<K> = Map<K, {| +label: string |}>;

type OptionsScreenProps<K> = $ReadOnly<{|
  navigation: NavigationScreenProp<{
    params: {|
      label: string,
      options: SelectionOptions<K>,
      selectedKey: K,
      onOptionSelect: <K>(key: K) => void,
    |},
  }>,
|}>;

type OptionsScreenState<K> = {|
  selectedKey: K,
|};

/**
 * A selection option list component.
 *
 * @prop label - label for selection list.
 * @prop options - all available options to select from.
 * @prop selectedKey - key of currently selected option.
 * @prop onOptionSelect - callback when any option is selected.
 */
export class OptionsScreen<K> extends PureComponent<OptionsScreenProps<K>, OptionsScreenState<K>> {
  state: OptionsScreenState<K> = {
    selectedKey: this.props.navigation.state.params.selectedKey,
  };

  styles = StyleSheet.create({
    item: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingTop: 12,
      paddingBottom: 12,
      paddingLeft: 16,
      paddingRight: 16,
    },
    selectedValue: { color: BRAND_COLOR },
  });

  // This is suppose to be a arrow func
  // But due to bug in flow, this is defined as regular func,
  // see https://github.com/facebook/flow/issues/8242
  handleOptionSelect(selectedKey: K) {
    const { onOptionSelect } = this.props.navigation.state.params;
    onOptionSelect(selectedKey);
    this.setState({ selectedKey });
  }

  render() {
    const { label, options } = this.props.navigation.state.params;
    const { selectedKey } = this.state;

    return (
      <Screen title={label}>
        <FlatList
          ItemSeparatorComponent={OptionDivider}
          data={Array.from(options, ([key, option]) => ({ ...option, key }))}
          keyExtractor={item => String(item.key)}
          renderItem={({ item, index }) => (
            <Touchable onPress={() => this.handleOptionSelect(item.key)}>
              <View style={this.styles.item}>
                <Label
                  style={selectedKey === item.key && this.styles.selectedValue}
                  text={item.label}
                />
                {selectedKey === item.key && <IconDone size={16} color={BRAND_COLOR} />}
              </View>
            </Touchable>
          )}
        />
      </Screen>
    );
  }
}

type SelectorProps<K> = $ReadOnly<{|
  label: string,
  options: SelectionOptions<K>,
  selectedKey: K,
  style?: ViewStyleProp,
  onOptionSelect: (key: K) => void,

  dispatch: Dispatch,
|}>;

/**
 * An selector component, which shows the the label and selected value
 *
 * @prop [style] - Style object applied to the outermost component.
 * @prop label - label for the selection list.
 * @prop options - all available options to select from.
 * @prop selectedKey - key of currently selected option.
 * @prop onOptionSelect - callback when any option is selected.
 */
export class Selector<K> extends PureComponent<SelectorProps<K>> {
  static contextType = ThemeContext;
  context: ThemeColors;

  styles = {
    wrapper: {
      marginTop: 4,
    },
    row: {
      flex: 1,
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    value: {
      color: 'gray',
      marginTop: 4,
    },
    icon: {
      alignSelf: 'center',
    },
    label: {
      fontWeight: '400',
    },
  };

  navigateToOptionListScreen = () => {
    const { dispatch, options, label, selectedKey, onOptionSelect } = this.props;
    dispatch(navigateToSelectionListOptionsScreen(label, options, selectedKey, onOptionSelect));
  };

  render() {
    const { label, options, selectedKey, style } = this.props;
    const selectedOption = options.get(selectedKey);

    if (!selectedOption) {
      throw new Error('missing selected option');
    }

    return (
      <Touchable style={[style, this.styles.wrapper]} onPress={this.navigateToOptionListScreen}>
        <View style={this.styles.row}>
          <View>
            <Label style={this.styles.label} text={label} />
            <Label style={this.styles.value} text={selectedOption.label} />
          </View>
          <IconRight size={24} style={[{ color: this.context.color }, this.styles.icon]} />
        </View>
      </Touchable>
    );
  }
}

export default {
  Selector: connect<{||}, _, _>()(Selector),
  OptionsScreen,
};
