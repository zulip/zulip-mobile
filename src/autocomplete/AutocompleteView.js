/* @flow strict-local */
import React, { PureComponent } from 'react';
import { StyleSheet } from 'react-native';

import type { InputSelection } from '../types';
import getAutocompletedText from './getAutocompletedText';
import getAutocompleteFilter from './getAutocompleteFilter';
import EmojiAutocomplete from './EmojiAutocomplete';
import StreamAutocomplete from './StreamAutocomplete';
import PeopleAutocomplete from './PeopleAutocomplete';
import AnimatedScaleComponent from '../animation/AnimatedScaleComponent';

const prefixToComponent = {
  ':': EmojiAutocomplete,
  '#': StreamAutocomplete,
  '@': PeopleAutocomplete,
};

type Props = $ReadOnly<{|
  isFocused: boolean,
  text: string,
  selection: InputSelection,
  onAutocomplete: (input: string) => void,
|}>;

const styles = StyleSheet.create({
  animatedScaleComponent: {
    zIndex: 1,
  },
});

export default class AutocompleteView extends PureComponent<Props> {
  handleAutocomplete = (autocomplete: string) => {
    const { text, onAutocomplete, selection } = this.props;
    const newText = getAutocompletedText(text, autocomplete, selection);
    onAutocomplete(newText);
  };

  render() {
    const { isFocused, text, selection } = this.props;
    const { lastWordPrefix, filter } = getAutocompleteFilter(text, selection);
    const AutocompleteComponent = prefixToComponent[lastWordPrefix];
    const shouldShow = isFocused && !!AutocompleteComponent && filter.length > 0;

    return (
      <AnimatedScaleComponent visible={shouldShow} style={styles.animatedScaleComponent}>
        {shouldShow && (
          <AutocompleteComponent filter={filter} onAutocomplete={this.handleAutocomplete} />
        )}
      </AnimatedScaleComponent>
    );
  }
}
