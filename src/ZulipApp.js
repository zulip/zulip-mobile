import React from 'react-native';

import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

// Actions
import { getLatestMessages } from './stream/streamActions';

// UI elements
import ZulipLoginView from './account/ZulipLoginView';
import ZulipDevLoginView from './account/ZulipDevLoginView';

import ZulipNavBar from './nav/ZulipNavBar';
import ZulipStreamView from './stream/ZulipStreamView';
import ZulipComposeBar from './compose/ZulipComposeBar';

import ZulipComposeView from './compose/ZulipComposeView';

const ZulipApp = (props) => {
  if (!props.loggedIn) {
    if (process.env.NODE_ENV !== 'production') {
      return <ZulipDevLoginView />
    }
    return (
      <ZulipLoginView />
    );
  }
  return (
    <ZulipNavBar>
      <ZulipStreamView />
      <ZulipComposeView />
    </ZulipNavBar>
  );
};

const mapStateToProps = (state) => ({
  loggedIn: state.account.loggedIn,
});

const mapDispatchToProps = (dispatch, ownProps) =>
  bindActionCreators({
  }, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(ZulipApp);
