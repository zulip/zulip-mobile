/* @flow */
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

type Props = {
  text: string,
  selection: InputSelectionType,
  onAutocomplete: (input: string) => void,
};

export default class AutocompleteView extends PureComponent<Props> {
  props: Props;

  handleAutocomplete = (autocomplete: string) => {
    const { text, onAutocomplete, selection } = this.props;
    const newText = getAutocompletedText(text, autocomplete, selection);
    onAutocomplete(newText);
  };

  render() {
    const { text, selection } = this.props;
    const result = getAutocompleteFilter(text, selection);

    const AutocompleteComponent = prefixToComponent[result.lastWordPrefix];

    return (
      <AnimatedScaleComponent visible={result.filter.length > 0}>
        {AutocompleteComponent && (
          <AutocompleteComponent filter={result.filter} onAutocomplete={this.handleAutocomplete} />
        )}
      </AnimatedScaleComponent>
    );
  }
}
