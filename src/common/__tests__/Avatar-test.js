import 'react-native';
import React from 'react';
import renderer from 'react-test-renderer';
import Avatar from '../Avatar';

it('renders correctly', () => {
  const tree = renderer.create(
    <Avatar />
  ).toJSON();
  expect(tree).toMatchSnapshot();
});
