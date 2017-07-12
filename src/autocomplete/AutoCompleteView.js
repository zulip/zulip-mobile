/* @flow */
import React from 'react';
import { View } from 'react-native';

import getAutocompletedText from './getAutocompletedText';
import getAutocompleteFilter from './getAutocompleteFilter';
import EmojiAutocomplete from './EmojiAutocomplete';
import StreamAutocomplete from './StreamAutocomplete';
import PeopleAutocomplete from './PeopleAutocomplete';

type Props = {
  text: string,
  onAutocomplete: (input: string) => void,
};

export default class AutoCompleteView extends React.Component {
  props: Props;

  handleAutocomplete = (autocomplete: string) => {
    const { text, onAutocomplete } = this.props;
    const newText = getAutocompletedText(text, autocomplete);
    onAutocomplete(newText);
  };

  render() {
    const { text } = this.props;
    const result = getAutocompleteFilter(text);
    return (
      <View>
        {result &&
          result.lastWordPrefix &&
          result.filter &&
          ((result.lastWordPrefix === ':' &&
            <EmojiAutocomplete
              filter={result.filter}
              onAutocomplete={this.handleAutocomplete}
            />) ||
            (result.lastWordPrefix === '#' &&
              <StreamAutocomplete
                filter={result.filter}
                onAutocomplete={this.handleAutocomplete}
              />) ||
            (result.lastWordPrefix === '@' &&
              <PeopleAutocomplete
                filter={result.filter}
                onAutocomplete={this.handleAutocomplete}
              />))}
      </View>
    );
  }
}
