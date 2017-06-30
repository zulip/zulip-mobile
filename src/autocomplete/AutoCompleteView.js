/* @flow */
import React from 'react';
import { View } from 'react-native';

import type { MatchResult } from '../types';
import getAutocompletedText from './getAutocompletedText';
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
  }

  render() {
    const { text } = this.props;
    const lastword: MatchResult = text.match(/\b(\w+)$/);
    const lastWordPrefix = lastword && lastword.index && text[lastword.index - 1];
    return (
      <View>
        {lastWordPrefix === ':' && lastword &&
          <EmojiAutocomplete filter={lastword[0]} onAutocomplete={this.handleAutocomplete} />}
        {lastWordPrefix === '#' && lastword &&
          <StreamAutocomplete filter={lastword[0]} onAutocomplete={this.handleAutocomplete} />}
        {lastWordPrefix === '@' && lastword &&
          <PeopleAutocomplete filter={lastword[0]} onAutocomplete={this.handleAutocomplete} />}
      </View>
    );
  }
}
