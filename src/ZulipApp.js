import React from 'react-native';

import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

// Actions
import { attemptLogin } from './account/loginActions';
import { getLatestMessages } from './stream/streamActions';

// UI elements
import ZulipLoginView from './account/ZulipLoginView';
import ZulipNavBar from './nav/ZulipNavBar';
import ZulipStreamView from './stream/ZulipStreamView';
import ZulipComposeBar from './compose/ZulipComposeBar';

const ZulipApp = (props) => {
  if (!props.loggedIn) {
    return (
      <ZulipLoginView
        attemptLogin={props.attemptLogin}
        pendingLogin={props.pendingLogin}
      />
    );
  }
  return (
    <ZulipNavBar>
      <ZulipStreamView
        getLatestMessages={props.getLatestMessages}
        messages={props.messages}
      />
      <ZulipComposeBar />
    </ZulipNavBar>
  );
};

const mapStateToProps = (state) => ({
  loggedIn: state.account.loggedIn,
  pendingLogin: state.account.pendingLogin,
  messages: state.stream.messages,
});

const mapDispatchToProps = (dispatch, ownProps) =>
  bindActionCreators({
    attemptLogin,
    getLatestMessages,
  }, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(ZulipApp);
