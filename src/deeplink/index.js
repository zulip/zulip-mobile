/* @flow strict-local */
import { Linking } from 'react-native';
import * as webAuth from '../start/webAuth';
import type { Dispatch, LinkingEvent } from '../types';

export const handleInitialUrl = async (dispatch: Dispatch) => {
  const initialUrl: ?string = await Linking.getInitialURL();
  if (initialUrl != null) {
    webAuth.endWebAuth({ url: initialUrl }, dispatch);
  }
};

export class UrlListener {
  dispatch: Dispatch;
  unsubs: Array<() => void> = [];

  constructor(dispatch: Dispatch) {
    this.dispatch = dispatch;
  }

  /** Private. */
  handleUrlEvent(event: LinkingEvent) {
    webAuth.endWebAuth(event, this.dispatch);
  }

  /** Private. */
  listen(handler: (event: LinkingEvent) => void | Promise<void>) {
    Linking.addEventListener('url', handler);
    this.unsubs.push(() => Linking.removeEventListener('url', handler));
  }

  /** Private. */
  unlistenAll() {
    while (this.unsubs.length > 0) {
      this.unsubs.pop()();
    }
  }

  /** Start listening.  Don't call twice without intervening `stop`. */
  start() {
    this.listen((event: LinkingEvent) => this.handleUrlEvent(event));
  }

  /** Stop listening. */
  stop() {
    this.unlistenAll();
  }
}
