/* @flow */
import React from 'react';
import { View } from 'react-native';
import { connect } from 'react-redux';

import { getAuth } from '../account/accountSelectors';
import styles from '../styles';
import ComposeText from './ComposeText';
import CameraRollView from './CameraRollView';
import { getLastTopicInActiveNarrow } from '../chat/chatSelectors';
import { Auth, Narrow } from '../types';
import StreamBox from './ModeViews/StreamBox';
import { isTopicNarrow, isStreamNarrow } from '../utils/narrow';

type Props = {
  onSend: (content: string) => void,
  auth: Auth,
  narrow: Narrow,
  lastTopic: string,
  users: Object[]
};

const composeComponents = [
  ComposeText,
  CameraRollView,
  View,
  View,
  View,
];

class ComposeBox extends React.Component {
  props: Props;

  state: {
    optionSelected: number,
    operator: string | null,
  };

  constructor(props: Props) {
    super(props);
    this.state = {
      optionSelected: 0,
      operator: null
    };
  }

  setTopic = (operator: string | null) => this.setState({ operator });

  handleOptionSelected = (optionSelected: number) =>
    this.setState({ optionSelected });

  render() {
    const { optionSelected, operator } = this.state;
    const { auth, narrow, users, lastTopic } = this.props;
    const ActiveComposeComponent = composeComponents[optionSelected];

    return (
      <View style={styles.composeBox}>
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
        </View>
      }
        <View style={styles.divider} />
        <ActiveComposeComponent
          auth={auth}
          narrow={narrow}
          operator={operator}
          users={users}
        />
      </View>
    );
  }
}

const mapStateToProps = (state) => ({
  auth: getAuth(state),
  narrow: state.chat.narrow,
  users: state.users,
  lastTopic: getLastTopicInActiveNarrow(state),
});

export default connect(mapStateToProps)(ComposeBox);
