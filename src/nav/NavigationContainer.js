import { connect } from 'react-redux';
import Navigation from './Navigation';
import { push, pop } from './navActions';

const mapStateToProps = (state) => ({
  navigation: state.nav,
});

export default connect(
  mapStateToProps, {
    pushRoute: (route) => push(route),
    popRoute: () => pop(),
  }
)(Navigation);
