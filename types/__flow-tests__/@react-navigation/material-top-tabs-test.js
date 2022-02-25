/* @flow strict-local */
import { type NavigationProp } from '@react-navigation/material-top-tabs';

/* eslint-disable no-unused-vars */

function test_setParams() {
  type NavProp<P> = NavigationProp<{| r: P |}, 'r'>;

  function test_happy(navigation: NavProp<{| a: number |}>) {
    navigation.setParams({ a: 1 });
  }

  function test_accepts_missing(navigation: NavProp<{| a: number, b: number |}>) {
    navigation.setParams({ a: 1 });
  }

  function test_rejects_extra(navigation: NavProp<{| a: number |}>) {
    // $FlowExpectedError[prop-missing]
    navigation.setParams({ b: 1 });
  }

  function test_rejects_mismatch(navigation: NavProp<{| a: number |}>) {
    // $FlowExpectedError[incompatible-call]
    navigation.setParams({ a: 'a' });
  }

  function test_rejects_object_to_void(navigation: NavProp<void>) {
    // $FlowExpectedError[incompatible-call]
    navigation.setParams({ a: 1 });
  }

  function test_rejects_void_to_object(navigation: NavProp<{| a: number |}>) {
    // $FlowExpectedError[incompatible-call]
    navigation.setParams();
  }
}
