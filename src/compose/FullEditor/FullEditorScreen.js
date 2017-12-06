/* @flow */
import React from 'react';
import { StyleSheet, TextInput } from 'react-native';

import { Screen, MultilineInput } from '../../common';
import AutoCompleteView from '../../autocomplete/AutoCompleteView';
import { BORDER_COLOR } from '../../styles';
import connectWithActions from '../../connectWithActions';
import { Subscription, Auth, Actions, User } from '../../types';

const inlineStyles = StyleSheet.create({
  composeText: {
    borderColor: BORDER_COLOR,
    borderWidth: 1,
    flexDirection: 'column',
    flex: 1,
    padding: 4,
    paddingLeft: 8,
    fontSize: 16,
  },
});

type Props = {
  navigation: {
    state: {
      params: {
        saveNewText: string => void,
        message: string,
      },
    },
  },
  realm_emoji: Object,
  realm_filter: [],
  streams: Subscription[],
  auth: Auth,
  actions: Actions,
  users: User[],
};

type State = {
  text: string,
  selection: Object,
};

class FullEditorScreen extends React.Component<Props, State> {
  props: Props;
  state: State;

  static contextTypes = {
    styles: () => null,
  };

  constructor(props) {
    super(props);
    this.state = {
      text: props.navigation.state.params.message || '',
      selection: { start: 0, end: 0 },
    };
  }
  textInput: TextInput;

   changeText = (input: string) => {
        this.setState({ text: input });
    };

  onSelectionChange = event => {
    this.setState({
      selection: event.nativeEvent.selection,
    });
  };

  componentDidMount() {
    this.textInput.focus();
  }

  submitText = () => {
    this.props.navigation.state.params.saveNewText(this.state.text);
    this.props.actions.navigateBack();
  };

  render() {
    const { text, selection } = this.state;
    return (
      <Screen
        title="Full screen editor"
        rightItem={{
          name: 'check',
          onPress: this.submitText,
        }}
        scrollView={false}
      >
        <MultilineInput
          style={inlineStyles.composeText}
          multiline
          underlineColorAndroid="transparent"
          onChange={this.changeText}
          onSelectionChange={this.onSelectionChange}
          value={text}
          placeholder="Write a long message"
          textInputRef={component => {
            this.textInput = component;
          }}
          selection={selection}
        />
        <AutoCompleteView
          text={text}
          onAutocomplete={input => this.setState({ text: input })}
          selection={selection}
        />
      </Screen>
    );
  }
}

export default connectWithActions(null)(FullEditorScreen);
