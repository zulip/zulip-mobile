/* @flow */
import React from 'react';
import Drawer from 'react-native-drawer';

type Props = {
  content: Object,
  open: boolean,
  side: string,
  onOpenStart: () => void,
  onClose: () => void,
  children?: any[],
  orientation: string,
};

export default (props: Props) =>
  <Drawer
    content={props.content}
    open={props.open}
    side={props.side}
    tapToClose
    openDrawerOffset={props.orientation === 'LANDSCAPE' ? 0.4 : 0.2}
    negotiatePan
    panOpenMask={0.1}
    useInteractionManager
    tweenDuration={150}
    tweenHandler={ratio => ({
      mainOverlay: {
        opacity: ratio / 2,
        backgroundColor: 'black',
      },
    })}
    onOpenStart={props.onOpenStart}
    onClose={props.onClose}>
    {props.children}
  </Drawer>;
