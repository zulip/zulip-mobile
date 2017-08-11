/* @flow */
import React, { PureComponent } from 'react';

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

export default class AutoCompleteView extends PureComponent {
  props: {
    text: string,
    onAutocomplete: (input: string) => void,
  };

  handleAutocomplete = (autocomplete: string) => {
    const { text, onAutocomplete } = this.props;
    const newText = getAutocompletedText(text, autocomplete);
    onAutocomplete(newText);
  };

  render() {
    const { text } = this.props;
    const result = getAutocompleteFilter(text);

    const AutocompleteComponent = prefixToComponent[result.lastWordPrefix];

    return (
      <AnimatedScaleComponent visible={result.filter.length > 0}>
        {AutocompleteComponent &&
          <AutocompleteComponent filter={result.filter} onAutocomplete={this.handleAutocomplete} />}
      </AnimatedScaleComponent>
    );
  }
}
