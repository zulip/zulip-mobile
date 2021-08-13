/* @flow strict-local */
import React, { PureComponent } from 'react';
import type { Node } from 'react';
import { View } from 'react-native';

import { Input, Label, SwitchRow, ZulipButton } from '../common';
import styles, { createStyleSheet } from '../styles';
import { IconPrivate } from '../common/Icons';

const componentStyles = createStyleSheet({
  switchRow: {
    paddingLeft: 8,
    paddingRight: 8,
  },
});

type Props = $ReadOnly<{|
  isNewStream: boolean,
  initialValues: {|
    name: string,
    description: string,
    invite_only: boolean,
  |},
  onComplete: (name: string, description: string, isPrivate: boolean) => void,
|}>;

type State = {|
  name: string,
  description: string,
  isPrivate: boolean,
|};

/**
 * (TODO: usefulness of these "card" components as separate from "screen"
 * components?)
 *
 * Needs to occupy the horizontal insets because some descendents (a
 * `SwitchRow`) do.
 */
export default class EditStreamCard extends PureComponent<Props, State> {
  state: State = {
    name: this.props.initialValues.name,
    description: this.props.initialValues.description,
    isPrivate: this.props.initialValues.invite_only,
  };

  handlePerformAction: () => void = () => {
    const { onComplete } = this.props;
    const { name, description, isPrivate } = this.state;
    onComplete(name, description, isPrivate);
  };

  handleNameChange: string => void = name => {
    this.setState({ name });
  };

  handleDescriptionChange: string => void = description => {
    this.setState({ description });
  };

  handleIsPrivateChange: boolean => void = isPrivate => {
    this.setState({ isPrivate });
  };

  render(): Node {
    const { initialValues, isNewStream } = this.props;
    const { name } = this.state;

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
        <SwitchRow
          style={componentStyles.switchRow}
          Icon={IconPrivate}
          label="Private"
          value={this.state.isPrivate}
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
