// @flow strict-local

import { useEffect } from 'react';
import NetInfo from '@react-native-community/netinfo';

import { connect } from '../../react-redux';
import { appOnline } from '../../actions';
import type { Dispatch } from '../../types';

/**
 * Part of the interface from react-native-netinfo.
 * https://github.com/react-native-community/react-native-netinfo/tree/v3.2.1
 */
// TODO: upgrade to 4.x.x so that we can use the `flow-typed` versions.
// Requires RN 0.60+.
type NetInfoStateType =
  | 'unknown'
  | 'none'
  | 'cellular'
  | 'wifi'
  | 'bluetooth'
  | 'ethernet'
  | 'wimax'
  | 'vpn'
  | 'other';

type NetInfoConnectedDetails = {
  isConnectionExpensive: boolean,
};

type NetInfoState = {
  /** The type of the current connection. */
  type: NetInfoStateType,

  /** Whether there is an active network connection. Note that this DOES NOT
      mean that the Internet is reachable. */
  isConnected: boolean,

  /**
   * This actually has a more complicated type whose exact shape is dependent on
   * the value of `type`, above. (Flow could describe it, but we don't have a
   * use for it yet.)
   */
  details: null | NetInfoConnectedDetails,
};

const NetworkStateHandler = ({ dispatch }: {| dispatch: Dispatch |}) => {
  useEffect(() => {
    const handleConnectivityChange = (netInfoState: NetInfoState) => {
      const { type: connectionType } = netInfoState;
      const isConnected = connectionType !== 'none' && connectionType !== 'unknown';
      dispatch(appOnline(isConnected));
    };

    return NetInfo.addEventListener(handleConnectivityChange);
  }, [dispatch]);

  return null;
};

export default connect()(NetworkStateHandler);
