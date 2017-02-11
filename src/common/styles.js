import { StyleSheet } from 'react-native';

import { CONTROL_SIZE } from './platform';

export const BRAND_COLOR = 'rgba(86, 193, 129, 1)';
export const HIGHLIGHT_COLOR = 'rgba(86, 164, 174, 0.5)';
export const BORDER_COLOR = BRAND_COLOR; // '#eee';

export default StyleSheet.create({
  flex: {
    flex: 1,
  },
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
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heading1: {
    fontSize: 24,
  },
  label: {
    fontSize: 15,
  },
  field: {
    flexDirection: 'row',
    height: CONTROL_SIZE,
    marginTop: 8,
  },
  marginBottom: {
    marginBottom: 8,
  },
  smallField: {
    flexDirection: 'row',
    height: CONTROL_SIZE / 2,
    marginRight: 8,
  },
  input: {
    borderWidth: 1,
    height: CONTROL_SIZE,
    borderColor: BORDER_COLOR,
    padding: 8,
  },
  navBar: {
    flexDirection: 'row',
    backgroundColor: BRAND_COLOR,
    height: CONTROL_SIZE,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  navTitle: {
    flex: 1,
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
    lineHeight: CONTROL_SIZE,
    height: CONTROL_SIZE,
  },
});
