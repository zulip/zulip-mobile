/* @flow */
import { PureComponent } from 'react';
import { connect } from 'react-redux';

import { Actions } from '../types';
import boundActions from '../boundActions';

class AppDataFetcher extends PureComponent {
  props: {
    needsInitialFetch: boolean,
    actions: Actions,
    children?: any,
  };

  componentWillMount = () => this.init(this.props);

  componentWillReceiveProps = nextProps => this.init(nextProps);

  init = props => {
    const { actions, needsInitialFetch } = props;

    if (needsInitialFetch) {
      actions.doInitialFetch();
    }
  };

  render() {
    return this.props.children;
  }
}

export default connect(
  state => ({
    needsInitialFetch: state.app.needsInitialFetch,
  }),
  boundActions,
)(AppDataFetcher);
