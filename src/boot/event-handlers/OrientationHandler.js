// @flow strict-local
import { useEffect } from 'react';
import Orientation, { type Orientations } from 'react-native-orientation';

import { connect } from '../../react-redux';
import { appOrientation } from '../../actions';
import type { Dispatch, Orientation as OrientationT } from '../../types';

const OrientationHandler = ({ dispatch }: {| dispatch: Dispatch |}) => {
  useEffect(() => {
    // The libdef says that this parameter is optional. The docs disagree.
    const handleOrientationChange = (orientation?: Orientations) => {
      if (!orientation) {
        return;
      }

      // Lookup table. More elaborate than a simple 'orientation !== LANDSCAPE'
      // test to ensure robustness against future additions to the enumeration.
      const converter = {
        LANDSCAPE: 'LANDSCAPE',
        PORTRAIT: 'PORTRAIT',
        PORTRAITUPSIDEDOWN: 'PORTRAIT',
        UNKNOWN: 'PORTRAIT',
      };
      const converted: OrientationT = converter[orientation];

      dispatch(appOrientation(converted));
    };

    Orientation.addOrientationListener(handleOrientationChange);
    return () => Orientation.removeOrientationListener(handleOrientationChange);
  }, [dispatch]);

  return null;
};

export default connect()(OrientationHandler);
