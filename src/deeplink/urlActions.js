/* @flow strict-local */
import type { Dispatch, GetState, Narrow } from '../types';

import * as NavigationService from '../nav/NavigationService';
import { getNarrowFromLink } from '../utils/linkProcessors';
import { getStreamsById } from '../subscriptions/subscriptionSelectors';
import { getOwnUserId } from '../users/userSelectors';
import { navigateToChat, navigateToRealmInputScreen } from '../nav/navActions';
import { getAccountStatuses } from '../account/accountsSelectors';
import { accountSwitch } from '../account/accountActions';

/** Navigate to the given narrow. */
const doNarrow = (narrow: Narrow) => (dispatch: Dispatch, getState: GetState) => {
  NavigationService.dispatch(navigateToChat(narrow));
};

/**
 * Navigates to a screen (of any logged in account) based on the deep link url.
 *
 * @param url deep link url of the form
 * `zulip://example.com/?email=example@example.com#narrow/valid-narrow`
 *
 */
export const navigateViaDeepLink = (url: URL) => async (dispatch: Dispatch, getState: GetState) => {
  const state = getState();
  const account = getAccountStatuses(state);
  const index = account.findIndex(
    x => x.realm.hostname === url.hostname && x.email === url.searchParams.get('email'),
  );
  if (index === -1) {
    NavigationService.dispatch(navigateToRealmInputScreen());
    return;
  }
  if (index > 0) {
    dispatch(accountSwitch(index));
    // TODO navigate to the screen pointed by deep link in new account.
    return;
  }

  const streamsById = getStreamsById(getState());
  const ownUserId = getOwnUserId(state);

  // For the current use case of the "realm" variable set below, it doesn't
  // matter if it is hosted on `http` or `https` hence choosing one arbitrarily.
  const realm = new URL(`http://${url.hostname}/`);
  const narrow = getNarrowFromLink(url.toString(), realm, streamsById, ownUserId);
  if (narrow) {
    dispatch(doNarrow(narrow));
  }
};
