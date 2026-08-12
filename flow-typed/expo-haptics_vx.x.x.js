// Flow type definitions for expo-haptics.

declare module 'expo-haptics' {
  declare export var NotificationFeedbackType: {|
    +Success: 'success',
    +Warning: 'warning',
    +Error: 'error',
  |};

  declare export var ImpactFeedbackStyle: {|
    +Light: 'light',
    +Medium: 'medium',
    +Heavy: 'heavy',
  |};

  declare export function notificationAsync(
    type?: $Values<typeof NotificationFeedbackType>,
  ): Promise<void>;

  declare export function impactAsync(
    style?: $Values<typeof ImpactFeedbackStyle>,
  ): Promise<void>;

  declare export function selectionAsync(): Promise<void>;
}