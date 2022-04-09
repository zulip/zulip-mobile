/* @flow strict-local */
import React, { PureComponent } from 'react';
import type { Node } from 'react';
import { View } from 'react-native';

import Input from '../common/Input';
import ZulipTextIntl from '../common/ZulipTextIntl';
import SwitchRow from '../common/SwitchRow';
import ZulipButton from '../common/ZulipButton';
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
  onComplete: (name: string, description: string, invite_only: boolean) => void | Promise<void>,
|}>;

type State = {|
  name: string,
  description: string,
  invite_only: boolean,
|};

export default class EditStreamCard extends PureComponent<Props, State> {
  state: State = {
    name: this.props.initialValues.name,
    description: this.props.initialValues.description,
    invite_only: this.props.initialValues.invite_only,
  };

  handlePerformAction: () => void = () => {
    const { onComplete } = this.props;
    const { name, description, invite_only } = this.state;
    onComplete(name, description, invite_only);
  };

  handleNameChange: string => void = name => {
    this.setState({ name });
  };

  handleDescriptionChange: string => void = description => {
    this.setState({ description });
  };

  handleInviteOnlyChange: boolean => void = invite_only => {
    this.setState({ invite_only });
  };

  render(): Node {
    const { initialValues, isNewStream } = this.props;
    const { name } = this.state;

    return (
      <View>
        <ZulipTextIntl text="Name" />
        <Input
          style={styles.marginBottom}
          placeholder="Name"
          autoFocus
          defaultValue={initialValues.name}
          onChangeText={this.handleNameChange}
        />
        <ZulipTextIntl text="Description" />
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
          value={this.state.invite_only}
          onValueChange={this.handleInviteOnlyChange}
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
