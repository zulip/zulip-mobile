/* @flow strict-local */
import React, { PureComponent } from 'react';

import type { InputSelectionType } from '../types';
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

type Props = {|
  isFocused: boolean,
  text: string,
  selection: InputSelectionType,
  onAutocomplete: (input: string) => void,
|};

export default class AutocompleteView extends PureComponent<Props> {
  handleAutocomplete = (autocomplete: string) => {
    const { text, onAutocomplete, selection } = this.props;
    const newText = getAutocompletedText(text, autocomplete, selection);
    onAutocomplete(newText);
  };

  render() {
    const { isFocused, text, selection } = this.props;
    const { sigil, filter } = getAutocompleteFilter(text, selection);
    const AutocompleteComponent = prefixToComponent[sigil];
    const shouldShow = isFocused && !!AutocompleteComponent && filter.length > 0;

    return (
      <AnimatedScaleComponent visible={shouldShow}>
        {shouldShow && (
          <AutocompleteComponent filter={filter} onAutocomplete={this.handleAutocomplete} />
        )}
      </AnimatedScaleComponent>
    );
  }
}
