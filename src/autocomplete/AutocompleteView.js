/* @flow strict-local */
import React, { PureComponent } from 'react';

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

  /**
   * The callback that is called when the user taps on any of the suggested items.
   *
   * @param input The text entered by the user, modified to include the autocompletion.
   * @param completion The suggestion selected by the user. Includes markdown formatting,
      but not the prefix. Eg. **FullName**, **StreamName**.
   * @param lastWordPrefix The type of the autocompletion - valid values are keys of 'prefixToComponent'.
   */
  onAutocomplete: (input: string, completion: string, lastWordPrefix: string) => void,
|}>;

export default class AutocompleteView extends PureComponent<Props> {
  handleAutocomplete = (autocomplete: string) => {
    const { text, onAutocomplete, selection } = this.props;
    const { lastWordPrefix } = getAutocompleteFilter(text, selection);
    const newText = getAutocompletedText(text, autocomplete, selection);
    onAutocomplete(newText, autocomplete, lastWordPrefix);
  };

  render() {
    const { isFocused, text, selection } = this.props;
    const { lastWordPrefix, filter } = getAutocompleteFilter(text, selection);
    const AutocompleteComponent = prefixToComponent[lastWordPrefix];
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
