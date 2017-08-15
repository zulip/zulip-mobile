/* @flow */
import { connect } from 'react-redux';

import boundActions from '../boundActions';
import {
  getAuth,
  getLocale,
  getOnlineNotification,
  getOfflineNotification,
  getTheme,
} from '../selectors';
import SettingsCard from './SettingsCard';

export default connect(
  state => ({
    offlineNotification: getOfflineNotification(state),
    onlineNotification: getOnlineNotification(state),
    locale: getLocale(state),
    theme: getTheme(state),
    auth: getAuth(state),
  }),
  boundActions,
)(SettingsCard);
