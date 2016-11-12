import React from 'react';
import {
  StyleSheet,
  View,
} from 'react-native';

import { BORDER_COLOR } from '../common/styles';
import ComposeOptions from './ComposeOptions';
import ComposeText from './ComposeText';
import CameraRollView from './CameraRollView';

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'column',
    borderTopWidth: 1,
    borderTopColor: BORDER_COLOR,
    backgroundColor: '#fff',
  },
});

type Props = {
  onSend: (content: string) => undefined,
};

const composeComponents = [
  ComposeText,
  CameraRollView,
  View,
  View,
  View,
];

export default class ComposeBox extends React.Component {

  props: Props;

  constructor(props: Props) {
    super(props);
    this.state = {
      optionSelected: 0,
    };
  }

  handleOptionSelected = (optionSelected: number) =>
    this.setState({ optionSelected });

  render() {
    const { optionSelected } = this.state;
    const ActiveComposeComponent = composeComponents[optionSelected];

    return (
      <View style={styles.wrapper}>
        <ActiveComposeComponent />
        <ComposeOptions onChange={this.handleOptionSelected} />
      </View>
    );
  }
}
