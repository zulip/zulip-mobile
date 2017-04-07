import {StyleSheet} from 'react-native';

import {STATUSBAR_HEIGHT, CONTROL_SIZE, NAVBAR_HEIGHT} from './platform';

export const BRAND_COLOR = 'rgba(66, 163, 109, 1)';
export const HIGHLIGHT_COLOR = 'rgba(86, 164, 174, 0.5)';
export const BORDER_COLOR = '#ddd';

export default StyleSheet.create({
  screen: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'stretch',
  },
  screenWrapper: {
    flex: 1,
    padding: 8,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'stretch',
  },
  navigationCard: {
    backgroundColor: 'white',
    shadowColor: 'transparent',
  },
  container: {
    flex: 1,
    padding: 16,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'stretch',
    marginTop: STATUSBAR_HEIGHT,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heading1: {
    fontSize: 24,
  },
  heading2: {
    fontSize: 20,
  },
  label: {
    fontSize: 15,
  },
  field: {
    flexDirection: 'row',
    height: CONTROL_SIZE,
    marginTop: 5,
    marginBottom: 5,
    lineHeight: CONTROL_SIZE,
  },
  disabled: {
    backgroundColor: '#ddd',
    color: '#333',
  },
  marginBottom: {
    marginBottom: 10,
  },
  smallField: {
    flexDirection: 'row',
    height: CONTROL_SIZE / 2,
    marginRight: 10,
  },
  input: {
    borderWidth: 1,
    height: CONTROL_SIZE,
    borderColor: BORDER_COLOR,
    padding: 10,
  },
  navBar: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    paddingTop: STATUSBAR_HEIGHT,
    height: NAVBAR_HEIGHT,
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderColor: BORDER_COLOR,
  },
  navTitle: {
    flex: 1,
    color: BRAND_COLOR,
    textAlign: 'center',
    fontSize: 16,
  },
});
