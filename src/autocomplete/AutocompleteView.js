/* @flow strict-local */
import React, { useCallback } from 'react';
import type { Node } from 'react';

import type { InputSelection, Narrow } from '../types';
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
  destinationNarrow: Narrow,

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

export default function AutocompleteView(props: Props): Node {
  const { isFocused, text, onAutocomplete, selection, destinationNarrow } = props;

  const handleAutocomplete = useCallback(
    (autocomplete: string) => {
      const { lastWordPrefix } = getAutocompleteFilter(text, selection);
      const newText = getAutocompletedText(text, autocomplete, selection);
      onAutocomplete(newText, autocomplete, lastWordPrefix);
    },
    [onAutocomplete, selection, text],
  );

  const { lastWordPrefix, filter } = getAutocompleteFilter(text, selection);
  const AutocompleteComponent = prefixToComponent[lastWordPrefix];
  const shouldShow = isFocused && !!AutocompleteComponent && filter.length > 0;

  return (
    <AnimatedScaleComponent visible={shouldShow}>
      {shouldShow && (
        <AutocompleteComponent
          filter={filter}
          onAutocomplete={handleAutocomplete}
          destinationNarrow={destinationNarrow}
        />
      )}
    </AnimatedScaleComponent>
  );
}
