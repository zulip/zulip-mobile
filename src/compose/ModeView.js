/* @flow */
import React from 'react';
import { View, StyleSheet } from 'react-native';

import { CONTROL_SIZE } from '../styles';
import ComposeOptions from './ComposeOptions';
import StreamBox from './ModeViews/StreamBox';
import PrivateBox from './ModeViews/PrivateBox';
import ComposeIcon from './ComposeIcon';
import { isTopicNarrow, isStreamNarrow, isPrivateOrGroupNarrow } from '../utils/narrow';
import { getUsersByEmails } from '../users/usersSelectors';

const inlineStyles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end'
  },
  divider: {
    width: 2,
    backgroundColor: '#ecf0f1', // eslint-disable-line
    margin: 4,
    minHeight: CONTROL_SIZE
  },
  icon: {
    alignItems: 'flex-end'
  }
});

export default class ModeView extends React.Component {
  state: {
    showOptions: boolean,
  };

  handleModeChanged: () => {}

  constructor() {
    super();
    this.state = {
      showOptions: true,
    };
  }

  handleModeChanged = (): void => {
    const { setOperator, narrow, lastTopic, users } = this.props;
    if (this.state.showOptions && (isTopicNarrow(narrow) || isStreamNarrow(narrow))) {
      if (narrow.length === 1) {
        setOperator(lastTopic);
      } else {
        setOperator(narrow[1].operand);
      }
    } else if (isPrivateOrGroupNarrow(narrow)) {
      const emails = narrow[0].operand.split(',');
      const names = getUsersByEmails(users, emails)
                        .map(user => user.fullName);
      setOperator({ name: names, email: emails });
    }
    this.setState({
      showOptions: !this.state.showOptions
    });
  };

  render() {
    const { showOptions } = this.state;
    const { setOperator, operator, optionSelected,
      handleOptionSelected, narrow, lastTopic, users } = this.props;
    const name = (isTopicNarrow(narrow) || isStreamNarrow(narrow)) ? 'ios-chatbubbles' : 'ios-person';
    const Box = (isTopicNarrow(narrow) || isStreamNarrow(narrow)) ? StreamBox : PrivateBox;
    return (
      <View style={inlineStyles.wrapper}>
        <ComposeIcon
          name={name}
          onChange={this.handleModeChanged}
          style={inlineStyles.icon}
          size={CONTROL_SIZE * 3 / 4}
        />
        <View style={inlineStyles.divider} />
        {showOptions ?
          <ComposeOptions selected={optionSelected} onChange={handleOptionSelected} />
        :
          <Box
            operator={operator}
            setOperator={setOperator}
            narrow={narrow}
            lastTopic={lastTopic}
            users={users}
          />
        }
      </View>
    );
  }
}
