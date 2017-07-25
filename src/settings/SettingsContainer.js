/* @flow */
import { connect } from 'react-redux';

import boundActions from '../boundActions';
import { getAuth } from '../selectors';
import SettingsCard from './SettingsCard';

export default connect(
  state => ({
    offlineNotification: state.settings.offlineNotification,
    onlineNotification: state.settings.onlineNotification,
    locale: state.settings.locale,
    theme: state.settings.theme,
    auth: getAuth(state),
  }),
  boundActions,
)(SettingsCard);
