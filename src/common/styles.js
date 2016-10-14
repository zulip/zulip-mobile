import { StyleSheet } from 'react-native';

export const BRAND_COLOR = '#24cac2';
export const HIGHLIGHT_COLOR = 'rgba(86, 164, 174, 0.5)';
export const BORDER_COLOR = '#eee';
export const STATUS_BAR_HEIGHT = 20;
export const FIELD_HEIGHT = 44;
export const COMPOSE_VIEW_HEIGHT = 44;

export default StyleSheet.create({
  screen: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'stretch',
  },
  navigationCard: {
    backgroundColor: 'white',
    shadowColor: 'transparent',
  },
  container: {
    flex: 1,
    padding: 20,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'stretch',
    marginTop: STATUS_BAR_HEIGHT,
  },
  centerer: {
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
    height: FIELD_HEIGHT,
    marginTop: 10,
  },
  smallField: {
    flexDirection: 'row',
    height: FIELD_HEIGHT / 2,
    marginRight: 10,
  },
  error: {
    color: 'red',
  },
  input: {
    borderWidth: 1,
    height: FIELD_HEIGHT,
    borderColor: BORDER_COLOR,
    padding: 10,
  },
  navBar: {
    flexDirection: 'row',
    backgroundColor: BRAND_COLOR,
    paddingTop: STATUS_BAR_HEIGHT,
    alignItems: 'stretch',
    justifyContent: 'space-between',
  },
  navButton: {
    color: 'white',
    textAlign: 'center',
    padding: 8,
    flex: 1,
    fontSize: 16,
  },
});
