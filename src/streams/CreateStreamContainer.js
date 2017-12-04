/* @flow */
import connectWithActions from '../connectWithActions';
import EditStreamCard from './EditStreamCard';

export default connectWithActions(() => ({
  initialValues: {
    name: '',
    description: '',
    isPrivate: false,
  },
}))(EditStreamCard);
