/* @flow */
import React from 'react';
import { StyleSheet, ScrollView, TextInput } from 'react-native';
import type { StyleObj } from 'react-native/Libraries/StyleSheet/StyleSheetTypes';

import { Input } from '../common';

const MIN_HEIGHT = 34;
const MAX_HEIGHT = 200;

const componentStyles = StyleSheet.create({
  wrapper: {
    flex: 1,
    flexDirection: 'column',
  },
});

export default class MultilineInput extends React.Component {

  props: {
    style?: StyleObj,
    placeholder?: string,
    onChange?: (text: string) => void,
  };

  textInput: TextInput;

  state: {
    contentHeight: number,
  }

  state = {
    contentHeight: MIN_HEIGHT,
  };

  handleOnChange = (event: Object) => {
    this.setState({ contentHeight: event.nativeEvent.contentSize.height });
  }

  render() {
    const { placeholder, style, onChange } = this.props;
    const { contentHeight } = this.state;
    const height = Math.min(Math.max(MIN_HEIGHT, contentHeight), MAX_HEIGHT);

    return (
      <ScrollView style={{ height }} contentContainerStyle={componentStyles.wrapper}>
        <Input
          style={style}
          textInputRef={component => { this.textInput = component; }}
          multiline
          underlineColorAndroid="transparent"
          height={height}
          onChange={this.handleOnChange}
          onChangeText={onChange}
          placeholder={placeholder}
        />
      </ScrollView>
    );
  }
}
