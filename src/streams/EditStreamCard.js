/* @flow */
import { connect } from 'react-redux';

import React, { PureComponent } from 'react';
import { View } from 'react-native';

import type { Dispatch } from '../types';
import { Input, Label, OptionRow, ZulipButton } from '../common';
import { getEditStreamScreenParams, getOwnEmail } from '../selectors';
import { getStreamEditInitialValues } from '../subscriptions/subscriptionSelectors';
import { createNewStream, updateExistingStream, navigateBack } from '../actions';

type Props = {
  dispatch: Dispatch,
  ownEmail: string,
  initialValues: {
    name: string,
    description: string,
    invite_only: boolean,
  },
  streamId: number,
};

type State = {
  name: string,
  description: string,
  isPrivate: boolean,
};

class EditStreamCard extends PureComponent<Props, State> {
  props: Props;
  state: State;

  static contextTypes = {
    styles: () => null,
  };

  state = {
    name: this.props.initialValues.name,
    description: this.props.initialValues.description,
    isPrivate: this.props.initialValues.invite_only,
  };

  handlePerformAction = () => {
    const { dispatch, ownEmail, streamId, initialValues } = this.props;
    const { name, description, isPrivate } = this.state;

    if (streamId === -1) {
      dispatch(createNewStream(name, description, [ownEmail], isPrivate));
    } else {
      dispatch(updateExistingStream(streamId, initialValues, { name, description, isPrivate }));
    }
    dispatch(navigateBack());
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
    const { initialValues, streamId } = this.props;
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
          text={streamId === -1 ? 'Create' : 'Update'}
          disabled={name.length === 0}
          onPress={this.handlePerformAction}
        />
      </View>
    );
  }
}

export default connect(state => ({
  ownEmail: getOwnEmail(state),
  streamId: getEditStreamScreenParams(state).streamId,
  initialValues: getStreamEditInitialValues(state),
}))(EditStreamCard);
