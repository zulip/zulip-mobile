/* @flow */
import React, { PureComponent } from 'react';
import { View } from 'react-native';
import { connect } from 'react-redux';

import type { Auth, Narrow, EditMessage, GlobalState, Actions } from '../types';
import { getAuth, getLastTopicInActiveNarrow } from '../selectors';
import ComposeText from './ComposeText';
import CameraRollView from './CameraRollView';
import StreamBox from './ModeViews/StreamBox';
import { isTopicNarrow, isStreamNarrow } from '../utils/narrow';
import AutoCompleteView from '../autocomplete/AutoCompleteView';
import boundActions from '../boundActions';

type Props = {
  auth: Auth,
  narrow: Narrow,
  lastTopic: string,
  users: Object[],
  editMessage: EditMessage,
  actions: Actions,
};

const composeComponents = [ComposeText, CameraRollView, View, View, View];

class ComposeBox extends PureComponent {
  static contextTypes = {
    styles: () => null,
  };

  props: Props;

  state: {
    optionSelected: number,
    operator: string,
    text: string,
  };

  constructor(props: Props) {
    super(props);
    this.state = {
      optionSelected: 0,
      operator: '',
      text: '',
    };
  }

  setTopic = (operator: string) => this.setState({ operator });

  handleOptionSelected = (optionSelected: number) => this.setState({ optionSelected });

  handleAutoComplete = input => this.setState({ text: input });

  handleChangeText = input => this.setState({ text: input });

  componentWillReceiveProps(nextProps) {
    if (nextProps.editMessage !== this.props.editMessage) {
      this.setState({
        text: nextProps.editMessage ? nextProps.editMessage.content : '',
      });
    }
  }

  render() {
    const { styles } = this.context;
    const { optionSelected, operator, text } = this.state;
    const { auth, narrow, users, lastTopic, editMessage, actions } = this.props;
    const ActiveComposeComponent = composeComponents[optionSelected];

    return (
      <View style={this.context.styles.composeBox}>
        <AutoCompleteView text={text} onAutocomplete={this.handleAutoComplete} />
        {(isTopicNarrow(narrow) || isStreamNarrow(narrow)) &&
          <View style={styles.topicWrapper}>
            <StreamBox
              optionSelected={optionSelected}
              handleOptionSelected={this.handleOptionSelected}
              setTopic={this.setTopic}
              operator={operator}
              users={users}
              narrow={narrow}
              lastTopic={lastTopic}
            />
          </View>}
        <View style={styles.divider} />
        <ActiveComposeComponent
          auth={auth}
          narrow={narrow}
          operator={operator}
          users={users}
          text={text}
          handleChangeText={this.handleChangeText}
          editMessage={editMessage}
          cancelEditMessage={actions.cancelEditMessage}
        />
      </View>
    );
  }
}

export default connect(
  (state: GlobalState) => ({
    auth: getAuth(state),
    narrow: state.chat.narrow,
    users: state.users,
    lastTopic: getLastTopicInActiveNarrow(state),
    editMessage: state.app.editMessage,
  }),
  boundActions,
)(ComposeBox);
