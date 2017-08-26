/* @flow */
import type { StatusBarStyle, ThemeType } from '../types';

export default (backgroundColor: string, textColor: string, theme: ThemeType): StatusBarStyle =>
  textColor === 'white' || (backgroundColor === 'transparent' && theme === 'night')
    ? 'light-content'
    : 'dark-content';
