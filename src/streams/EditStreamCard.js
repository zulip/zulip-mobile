/* @flow strict-local */
import React, { PureComponent } from 'react';
import { View } from 'react-native';

import type { Context } from '../types';
import { Input, Label, OptionRow, ZulipButton } from '../common';

type Props = {|
  isNewStream: boolean,
  initialValues: {
    name: string,
    description: string,
    invite_only: boolean,
  },
  onComplete: (name: string, description: string, isPrivate: boolean) => void,
|};

type State = {|
  name: string,
  description: string,
  isPrivate: boolean,
|};

export default class EditStreamCard extends PureComponent<Props, State> {
  context: Context;
  state = {
    name: this.props.initialValues.name,
    description: this.props.initialValues.description,
    isPrivate: this.props.initialValues.invite_only,
  };

  static contextTypes = {
    styles: () => null,
  };

  handlePerformAction = () => {
    const { onComplete } = this.props;
    const { name, description, isPrivate } = this.state;
    onComplete(name, description, isPrivate);
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
    const { initialValues, isNewStream } = this.props;
    const { name } = this.state;
    const { styles } = this.context;

    return (
      <View>
        <Label text="Name" />
        <Input
          style={styles.marginBottom}
          placeholder="Name"
          autoFocus
          defaultValue={initialValues.name}
          onChangeText={this.handleNameChange}
        />
        <Label text="Description" />
        <Input
          style={styles.marginBottom}
          placeholder="Description"
          defaultValue={initialValues.description}
          onChangeText={this.handleDescriptionChange}
        />
        <OptionRow
          label="Private"
          defaultValue={initialValues.invite_only}
          onValueChange={this.handleIsPrivateChange}
        />
        <ZulipButton
          style={styles.marginTop}
          text={isNewStream ? 'Create' : 'Update'}
          disabled={name.length === 0}
          onPress={this.handlePerformAction}
        />
      </View>
    );
  }
}
