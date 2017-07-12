import React from 'react';
import { View, StyleSheet } from 'react-native';

import ComposeOptions from './ComposeOptions';
import StreamBox from './ModeViews/StreamBox';
import ComposeIcon from './ComposeIcon';
import { isTopicNarrow, isStreamNarrow } from '../utils/narrow';

const inlineStyles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
  },
  divider: {
    width: 2,
    backgroundColor: '#ECF0F1',
    margin: 4,
  },
});

export default class ModeView extends React.Component {
  constructor() {
    super();
    this.state = {
      showOptions: true,
    };
  }

  handleModeChanged = () => {
    const { setTopic, narrow, lastTopic } = this.props;
    if (this.state.showOptions && (isTopicNarrow(narrow) || isStreamNarrow(narrow))) {
      if (narrow.length === 1) {
        setTopic(lastTopic);
      } else {
        setTopic(narrow[1].operand);
      }
    } else {
      setTopic(null);
    }
    this.setState({
      showOptions: !this.state.showOptions,
    });
  };

  render() {
    const { showOptions } = this.state;
    const {
      setTopic,
      operator,
      optionSelected,
      handleOptionSelected,
      narrow,
      lastTopic,
    } = this.props;

    return (
      <View style={inlineStyles.wrapper}>
        {(isTopicNarrow(narrow) || isStreamNarrow(narrow)) &&
          <View style={inlineStyles.wrapper}>
            <ComposeIcon name="ios-chatbubbles" onChange={this.handleModeChanged} />
            <View style={inlineStyles.divider} />
          </View>}
        {showOptions
          ? <ComposeOptions selected={optionSelected} onChange={handleOptionSelected} />
          : <StreamBox
              operator={operator}
              setTopic={setTopic}
              narrow={narrow}
              lastTopic={lastTopic}
            />}
      </View>
    );
  }
}
