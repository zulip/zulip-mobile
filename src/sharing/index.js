/* @flow strict-local */
import { NativeModules, DeviceEventEmitter, Platform } from 'react-native';
import type { Dispatch, SharedData, GetState } from '../types';
import { navigateToSharing } from '../actions';

const Sharing = NativeModules.Sharing ?? {
  getInitialSharedContent: () =>
    // TODO: Implement on iOS.
    null,
};

const goToSharing = (data: SharedData) => (dispatch: Dispatch, getState: GetState) => {
  dispatch(navigateToSharing(data));
};

export const handleInitialShare = async (dispatch: Dispatch) => {
  const initialSharedData: SharedData | null = await Sharing.getInitialSharedContent();
  if (initialSharedData !== null) {
    dispatch(goToSharing(initialSharedData));
  }
};

export class ShareReceivedListener {
  dispatch: Dispatch;
  unsubs: Array<() => void> = [];

  constructor(dispatch: Dispatch) {
    this.dispatch = dispatch;
  }

  /** Private. */
  listen(name: string, handler: (...empty) => void | Promise<void>) {
    if (Platform.OS === 'android') {
      const subscription = DeviceEventEmitter.addListener(name, handler);
      this.unsubs.push(() => subscription.remove());
    }
  }

  /** Private. */
  unlistenAll() {
    while (this.unsubs.length > 0) {
      this.unsubs.pop()();
    }
  }

  handleShareReceived = (data: SharedData) => {
    this.dispatch(goToSharing(data));
  };

  /** Start listening.  Don't call twice without intervening `stop`. */
  start() {
    if (Platform.OS === 'android') {
      this.listen('shareReceived', this.handleShareReceived);
    }
  }

  /** Stop listening. */
  stop() {
    this.unlistenAll();
  }
}
