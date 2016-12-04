import {
  AppState,
} from 'react-native';
import throttle from 'lodash.throttle';

import { focusPing } from '../api';
import { Auth } from '../api/apiFetch';

// Send once per minute.
// Send when restored from suspended state
// Send on new compose message
// Send on new narrow event

export default class ActivityManager {

  auth: Auth;

  constructor(auth: Auth) {
    this.auth = auth;

    AppState.addEventListener('change', this.handleAppStateChange);
  }

  // componentWillUnmount() {
  //   AppState.removeEventListener('change', this.handleAppStateChange);
  // }

  appActivity() {
    throttle(() => focusPing(this.props.auth, true, false), 1000 * 60);
  }

  userInputActivity() {
    throttle(() => focusPing(this.props.auth, true, false), 1000 * 5);
  }

  handleAppStateChange = (currentAppState) => {
    if (currentAppState === 'active') {
      this.appActivity();
    }
  }
}
