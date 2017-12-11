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
  initialValues: {
    name: string,
    description: string,
    isPrivate: boolean,
  },
  onUpdate: (name: string, description: string, isPrivate: boolean) => void,
};

type State = {
  name: string,
  description: string,
  isPrivate: boolean,
};

export default class EditStreamCard extends PureComponent<Props, State> {
  props: Props;
  state: State;

  state = {
    name: this.props.initialValues.name,
    description: this.props.initialValues.description,
    isPrivate: this.props.initialValues.isPrivate,
  };

  handlePerformAction = () => {
    const { onUpdate } = this.props;
    const { name, description, isPrivate } = this.state;

    onUpdate(name, description, isPrivate);
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
    const { name, description, isPrivate } = this.props.initialValues;

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
        <ZulipButton style={styles.marginTop} text="Create" onPress={this.handlePerformAction} />
      </View>
    );
  }
}
