/* @flow strict-local */
import React, { PureComponent } from 'react';
import { connect } from 'react-redux';

import type { Dispatch, GlobalState, User } from '../types';
import { getSelfUserDetail } from '../selectors';
import { Screen } from '../common';
import { doUpdateUserProfile, navigateBack } from '../actions';
import EditProfileCard from './EditProfileCard';

type Props = {
  dispatch: Dispatch,
  selfUserDetail: User,
};

class EditProfileScreen extends PureComponent<Props> {
  handleComplete = (full_name: string) => {
    const { selfUserDetail, dispatch } = this.props;
    dispatch(doUpdateUserProfile(selfUserDetail, { full_name }));
    dispatch(navigateBack());
  };

  render() {
    return (
      <Screen title="Edit profile" padding>
        <EditProfileCard
          selfUserDetail={this.props.selfUserDetail}
          onComplete={this.handleComplete}
        />
      </Screen>
    );
  }
}

export default connect((state: GlobalState) => ({
  selfUserDetail: getSelfUserDetail(state),
}))(EditProfileScreen);
