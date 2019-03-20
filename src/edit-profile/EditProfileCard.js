/* @flow strict-local */
import React, { PureComponent } from 'react';
import { View } from 'react-native';

import { ZulipButton, Input, Label } from '../common';
import type { User } from '../types';
import styles from '../styles';

type Props = {
  selfUserDetail: User,
  onComplete: (fullNname: string) => void,
};

type State = {
  fullName: string,
  hasDetailsChanged: boolean,
};

export default class EditProfileCard extends PureComponent<Props, State> {
  state = {
    fullName: this.props.selfUserDetail.full_name,
    hasDetailsChanged: false,
  };

  handlePerformAction = () => {
    const { onComplete } = this.props;
    const { fullName } = this.state;
    onComplete(fullName);
  };

  handleFullNameChange = (fullName: string) => {
    this.setState({ fullName }, this.updateDetailsChanged);
  };

  updateDetailsChanged = () => {
    const { selfUserDetail } = this.props;
    const { fullName } = this.state;
    const hasDetailsChanged = fullName !== selfUserDetail.full_name;

    this.setState({ hasDetailsChanged });
  };

  render() {
    const { fullName, hasDetailsChanged } = this.state;

    return (
      <View>
        <Label text="Name" />
        <Input
          style={styles.marginBottom}
          placeholder="Name"
          defaultValue={fullName}
          onChangeText={this.handleFullNameChange}
        />
        <ZulipButton
          style={styles.marginTop}
          text="Update"
          disabled={!hasDetailsChanged}
          onPress={this.handlePerformAction}
        />
      </View>
    );
  }
}
