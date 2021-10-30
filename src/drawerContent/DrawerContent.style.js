import { StyleSheet } from 'react-native';
import { BRAND_COLOR, createStyleSheet } from '../styles';

const styles = StyleSheet.create({
  logoImage: {
    width: 50,
    height: 50,
    marginLeft: 24,
    marginTop: 10,
  },
  realmName: {
    fontWeight: 'bold',
    color: BRAND_COLOR,
    fontSize: 18,
  },
  realmUrl: {
    fontWeight: '100',
    color: BRAND_COLOR,
    fontSize: 12,
    opacity: 0.6,
  },
  realmView: {
    position: 'absolute',
    top: 13,
    left: 80,
  },
});

export default styles;
