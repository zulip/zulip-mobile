// @flow strict-local
import { PureComponent } from 'react';
import { AppState } from 'react-native';
import type { Auth, Dispatch } from '../types';

import { connect } from '../react-redux';
import { tryGetAuth } from '../account/accountsSelectors';
import { reportPresence } from '../actions';
import Heartbeat from './heartbeat';

type Props = $ReadOnly<{|
  dispatch: Dispatch,
  auth: Auth | void,
|}>;

/**
 * Component providing a recurrent `presence` signal.
 */
// Note that "PureComponent" is of questionable veracity: this component's
// entire purpose is to emit network calls for their observable side effects.
// However, it is at least true that there is never a need to call `render()` if
// the props haven't changed.
class PresenceHeartbeat extends PureComponent<Props> {
  /** Callback for Heartbeat object. */
  onHeartbeat = () => {
    // N.B.: If `auth` changes, we do not send out a final `false` presence
    // status for the previous `auth`. It's the responsibility of our logout
    // handler to determine whether that's necessary.
    //
    // (TODO: ensure that our logout handlers actually do that.)
    if (this.props.auth) {
      this.props.dispatch(reportPresence(true));
    }
  };

  heartbeat: Heartbeat = new Heartbeat(this.onHeartbeat, 1000 * 60);

  componentDidMount() {
    this.updateHeartbeatState(); // conditional start
    AppState.addEventListener('change', this.updateHeartbeatState);
  }

  componentWillUnmount() {
    AppState.removeEventListener('change', this.updateHeartbeatState);
    this.heartbeat.stop(); // unconditional stop
  }

  // React to any state change.
  updateHeartbeatState: () => void = () => {
    // heartbeat.toState is idempotent
    this.heartbeat.toState(AppState.currentState === 'active' && !!this.props.auth);
  };

  // React to props changes.
  //
  // Not dependent on `render()`'s return value, although the docs may not yet
  // be clear on that. See: https://github.com/reactjs/reactjs.org/pull/1230.
  componentDidUpdate() {
    this.updateHeartbeatState();
  }

  render() {
    return null;
  }
}

export default connect(state => ({
  auth: tryGetAuth(state),
}))(PresenceHeartbeat);
