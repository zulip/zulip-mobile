import React from 'react';
import { connect } from 'react-redux';

import StartScreen from './account/StartScreen';
import MainScreen from './nav/MainScreen';

const App = (props) =>
  (props.isLoggedIn ? <MainScreen /> : <StartScreen />);

const mapStateToProps = (state) => ({
  isLoggedIn: state.app.get('isLoggedIn'),
});

export default connect(mapStateToProps)(App);
