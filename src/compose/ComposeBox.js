/* @flow */
import React from 'react';
import { View } from 'react-native';

import styles from '../styles';
// import ComposeOptions from './ComposeOptions';
import ComposeText from './ComposeText';
import CameraRollView from './CameraRollView';

type Props = {
  onSend: (content: string) => void,
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

  state: {
    optionSelected: number
  };

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
      <View style={styles.composeBox}>
        <ActiveComposeComponent />
        {/* <ComposeOptions selected={optionSelected} onChange={this.handleOptionSelected} /> */}
      </View>
    );
  }
}
