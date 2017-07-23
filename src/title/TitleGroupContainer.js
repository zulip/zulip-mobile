/* @flow */
import { connect } from 'react-redux';

import boundActions from '../boundActions';
import { getRecipientsInGroupNarrow } from '../selectors';
import TitleGroup from './TitleGroup';

export default connect(
  state => ({
    recipients: getRecipientsInGroupNarrow(state),
  }),
  boundActions,
)(TitleGroup);
