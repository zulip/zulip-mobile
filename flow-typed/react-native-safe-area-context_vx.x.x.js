// node_modules/react-native-safe-area-context/lib/typescript/src/SafeArea.types.d.ts
declare module 'react-native-safe-area-context/SafeArea.types' {
  declare export type Edge = 'top' | 'right' | 'bottom' | 'left';
  declare export interface EdgeInsets {
    top: number;
    right: number;
    bottom: number;
    left: number;
  }
  declare export interface Rect {
    x: number;
    y: number;
    width: number;
    height: number;
  }
  declare export interface Metrics {
    insets: EdgeInsets;
    frame: Rect;
  }
  declare export type InsetChangedEvent = NativeSyntheticEvent<Metrics>;
  declare export type InsetChangeNativeCallback = (event: InsetChangedEvent) => void;
  declare export interface NativeSafeAreaProviderProps {
    children?: React.Node;
    style?: StyleProp<ViewStyle>;
    onInsetsChange: InsetChangeNativeCallback;
  }
  declare export type NativeSafeAreaViewProps = ViewProps & {
    children?: React.Node,
    mode?: 'padding' | 'margin',
    edges?: $ReadOnlyArray<Edge>,
    ...
  };
}

// node_modules/react-native-safe-area-context/lib/typescript/src/SafeAreaContext.d.ts
declare module 'react-native-safe-area-context/SafeAreaContext' {
  import type {
    Rect,
    NativeSafeAreaViewProps,
    EdgeInsets,
    Metrics,
  } from 'react-native-safe-area-context/SafeArea.types';

  declare export var SafeAreaInsetsContext: React.Context<EdgeInsets | null>;
  declare export var SafeAreaFrameContext: React.Context<Rect | null>;
  declare export interface SafeAreaViewProps {
    children?: React.Node;
    initialMetrics?: Metrics | null;

    /**
     * @deprecated
     */
    initialSafeAreaInsets?: EdgeInsets | null;
    style?: StyleProp<ViewStyle>;
  }
  declare export function SafeAreaProvider(x: SafeAreaViewProps): React$Node;
  declare export function useSafeAreaInsets(): EdgeInsets;
  declare export function useSafeAreaFrame(): Rect;
  declare export function withSafeAreaInsets<T>(
    WrappedComponent: React$ComponentType<T>,
  ): React.ForwardRefExoticComponent<React.PropsWithoutRef<T> & React.RefAttributes<T>>;

  /**
   * @deprecated
   */
  declare export function useSafeArea(): EdgeInsets;

  /**
   * @deprecated
   */
  declare export var SafeAreaConsumer: React.Consumer<EdgeInsets | null>;
  /**
   * @deprecated
   */
  declare export var SafeAreaContext: React.Context<EdgeInsets | null>;
}

// node_modules/react-native-safe-area-context/lib/typescript/src/SafeAreaView.d.ts
declare module 'react-native-safe-area-context/SafeAreaView' {
  // Not sure why Prettier wants to remove this.
  // prettier-ignore
  import type { NativeSafeAreaViewProps } from 'react-native-safe-area-context/SafeArea.types';

  declare export function SafeAreaView(x: NativeSafeAreaViewProps): React$Node;
}

// node_modules/react-native-safe-area-context/lib/typescript/src/InitialWindow.d.ts
declare module 'react-native-safe-area-context/InitialWindow' {
  // Not sure why Prettier wants to remove this.
  // prettier-ignore
  import type { Metrics, EdgeInsets } from 'react-native-safe-area-context/SafeArea.types';

  declare export var initialWindowMetrics: Metrics | null;
  /**
   * @deprecated
   */
  declare export var initialWindowSafeAreaInsets: EdgeInsets | null;
}

// node_modules/react-native-safe-area-context/lib/typescript/src/index.d.ts
declare module 'react-native-safe-area-context' {
  declare export * from 'react-native-safe-area-context/SafeAreaContext'
  declare export * from 'react-native-safe-area-context/SafeAreaView'
  declare export * from 'react-native-safe-area-context/InitialWindow'
  declare export * from 'react-native-safe-area-context/SafeArea.types'
}
