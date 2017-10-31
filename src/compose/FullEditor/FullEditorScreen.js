/* @flow */
import React from 'react';
import { View, StyleSheet, TextInput } from 'react-native';
import parseMarkdown from 'zulip-markdown-parser';

import Icon from '../../common/Icons';
import { Screen, MultilineInput } from '../../common';
import { renderFormatButtons } from './renderButtons';
import { getAuth } from '../../account/accountSelectors';
import AutoCompleteView from '../../autocomplete/AutoCompleteView';
import { BORDER_COLOR } from '../../styles';
import connectWithActions from '../../connectWithActions';
import htmlToDomTree from '../../html/htmlToDomTree';
import renderHtmlChildren from '../../html/renderHtmlChildren';
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
  buttonContainer: {
    flex: 0,
    flexDirection: 'row',
  },
  inlinePadding: {
    padding: 8,
  },
  preview: {
    padding: 5,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
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
  showPreview: boolean,
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
      showPreview: false,
    };
  }
  textInput: TextInput;

  changeText = (input: string) => {
    if (input === '') {
      this.setState({ showPreview: false, text: input });
    } else {
      this.setState({ text: input });
    }
  };

  onSelectionChange = event => {
    this.setState({
      selection: event.nativeEvent.selection,
    });
  };

  componentDidMount() {
    this.textInput.focus();
  }

  getState = () => {
    this.setState({
      selection: {
        start: 1,
        end: 1,
      },
    });
    return this.state;
  };

  submitText = () => {
    this.props.navigation.state.params.saveNewText(this.state.text);
    this.props.actions.navigateBack();
  };

  convertMarkdown = () => {
    this.setState({ showPreview: !this.state.showPreview });
  };

  renderPreview = () => {
    const { users, streams, auth, realm_emoji, realm_filter } = this.props;
    const html = parseMarkdown(this.state.text, users, streams, auth, realm_filter, realm_emoji);
    const childrenNodes = htmlToDomTree(html);
    return (
      <View style={inlineStyles.preview}>
        {renderHtmlChildren({
          childrenNodes,
          auth,
          actions: {},
          message: {},
        })}
      </View>
    );
  };
  render() {
    const { text, selection, showPreview } = this.state;
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
        {showPreview ? this.renderPreview() : null}
        <AutoCompleteView
          text={text}
          onAutocomplete={input => this.setState({ text: input })}
          selection={selection}
        />
        <View style={inlineStyles.buttonContainer}>
          <Icon
            name="arrow-up"
            onPress={this.convertMarkdown}
            size={28}
            style={inlineStyles.inlinePadding}
            color={BORDER_COLOR}
          />
          {renderFormatButtons({
            getState: this.getState,
            setState: (state, callback) => {
              this.textInput.focus();
              this.setState(state, callback);
            },
          })}
        </View>
      </Screen>
    );
  }
}

export default connectWithActions(state => ({
  auth: getAuth(state),
  narrow: state.chat.narrow,
  users: state.users,
  streams: state.subscriptions,
  realm_emoji: state.realm.emoji,
  realm_filter: state.realm.filters,
}))(FullEditorScreen);
