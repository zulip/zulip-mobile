/* @flow strict-local */
import React, { PureComponent } from 'react';
import { StyleSheet, View } from 'react-native';

import type { Dispatch } from '../types';
import { connect } from '../react-redux';
import { Input, Label, OptionRow, ZulipButton } from '../common';
import styles from '../styles';
import { IconPrivate } from '../common/Icons';
import { getIsAdmin } from '../selectors';

const componentStyles = StyleSheet.create({
  optionRow: {
    paddingLeft: 8,
    paddingRight: 8,
  },
});

type SelectorProps = {|
  isAdmin: boolean,
|};

type Props = $ReadOnly<{|
  dispatch: Dispatch,
  isNewStream: boolean,
  initialValues: {
    name: string,
    description: string,
    invite_only: boolean,
    stream_post_policy: number,
  },
  onComplete: (
    name: string,
    description: string,
    isPrivate: boolean,
    streamPostPolicy: number,
  ) => void,

  ...SelectorProps,
|}>;

type State = {|
  name: string,
  description: string,
  isPrivate: boolean,
  streamPostPolicy: number,
|};

class EditStreamCard extends PureComponent<Props, State> {
  state = {
    name: this.props.initialValues.name,
    description: this.props.initialValues.description,
    isPrivate: this.props.initialValues.invite_only,
    streamPostPolicy: this.props.initialValues.stream_post_policy,
  };

  handlePerformAction = () => {
    const { onComplete } = this.props;
    const { name, description, isPrivate, streamPostPolicy } = this.state;
    onComplete(name, description, isPrivate, streamPostPolicy);
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

  handleIsAnnouncementChange = (isAnnouncementOnly: boolean) => {
    this.setState({ streamPostPolicy: isAnnouncementOnly ? 2 : 1 });
  };

  render() {
    const { initialValues, isNewStream, isAdmin } = this.props;
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
        <OptionRow
          style={componentStyles.optionRow}
          Icon={IconPrivate}
          label="Private"
          value={this.state.isPrivate}
          onValueChange={this.handleIsPrivateChange}
        />
        {isAdmin && (
          <OptionRow
            style={componentStyles.optionRow}
            label="Restrict posting to organization administrators"
            value={this.state.streamPostPolicy === 2}
            onValueChange={this.handleIsAnnouncementChange}
          />
        )}
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

export default connect<SelectorProps, _, _>((state, props) => ({
  isAdmin: getIsAdmin(state),
}))(EditStreamCard);
