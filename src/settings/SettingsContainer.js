/* @TODO flow */
import connectWithActions from '../connectWithActions';
import { getAuth } from '../selectors';
import SettingsCard from './SettingsCard';

export default connectWithActions(state => ({
  offlineNotification: state.settings.offlineNotification,
  onlineNotification: state.settings.onlineNotification,
  theme: state.settings.theme,
  auth: getAuth(state),
}))(SettingsCard);
