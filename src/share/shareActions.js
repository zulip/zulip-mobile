/* @flow */
import {
  PUT_DATA,
  REMOVE_DATA,
} from '../actionConstants';

export const putData = (data: string) => ({
  type: PUT_DATA,
  data,
});

export const removeData = () => ({
  type: REMOVE_DATA,
});
