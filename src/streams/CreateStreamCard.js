/* @flow */
import React, { PureComponent } from 'react';
import { StyleSheet, View } from 'react-native';

import type { Actions } from '../types';
import { Input, OptionRow, ZulipButton } from '../common';

const styles = StyleSheet.create({
  marginBottom: {
    marginBottom: 10,
  },
  marginTop: {
    marginTop: 10,
  },
});

type Props = {
  actions: Actions,
};

type State = {
  name: string,
  description: string,
  isPrivate: boolean,
};

export default class CreateStreamCard extends PureComponent<Props, State> {
  props: Props;
  state: State;

  state = {
    name: '',
    description: '',
    isPrivate: false,
  };

  handleCreateScreen = () => {
    const { actions } = this.props;
    const { name, description, isPrivate } = this.state;

    actions.createNewStream(name, description, [], isPrivate);
    actions.navigateBack();
  };

  handleNameChange = (name: string) => {
    this.setState({ name });
  };

  handleDescriptionChange = (description: string) => {
    this.setState({ description });
  };

  handleIsPrivateChange = (isPrivate: boolean) => {
    this.setState({ isPrivate });
  };

  render() {
    const { name, description, isPrivate } = this.state;

    return (
      <View>
        <Input
          style={styles.marginBottom}
          placeholder="Name"
          autoFocus
          defaultValue={name}
          onChangeText={this.handleNameChange}
        />
        <Input
          style={styles.marginBottom}
          placeholder="Description"
          defaultValue={description}
          onChangeText={this.handleDescriptionChange}
        />
        <OptionRow
          label="Private"
          defaultValue={isPrivate}
          onValueChange={this.handleIsPrivateChange}
        />
        <ZulipButton style={styles.marginTop} text="Create" onPress={this.handleCreateScreen} />
      </View>
    );
  }
}
