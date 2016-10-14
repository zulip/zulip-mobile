import { StyleSheet } from 'react-native';

export const BRAND_COLOR = '#24cac2';
export const BORDER_COLOR = '#eee';
export const STATUS_BAR_HEIGHT = 20;
export const FIELD_HEIGHT = 44;
export const COMPOSE_VIEW_HEIGHT = 44;

export default StyleSheet.create({
  navigation: {
    backgroundColor: 'transparent',
    shadowColor: 'transparent',
  },
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'stretch',
    marginTop: STATUS_BAR_HEIGHT,
    padding: 20,
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
    flex: 1,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    padding: 10,
  },
});
