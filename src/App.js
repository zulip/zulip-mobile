import React from 'react';
import { connect } from 'react-redux';

import NavigationContainer from './nav/NavigationContainer';

const App = (props) =>
  <NavigationContainer />;

const mapStateToProps = (state) => ({
  isLoggedIn: state.app.isLoggedIn,
});

export default connect(mapStateToProps)(App);
