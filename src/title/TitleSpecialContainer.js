/* @flow */
import connectWithActions from '../connectWithActions';
import TitleSpecial from './TitleSpecial';

export default connectWithActions((state, props) => ({
  narrow: props.narrow,
}))(TitleSpecial);
