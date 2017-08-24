/* @flow */
import { isStreamOrTopicNarrow } from '../utils/narrow';
import type { Narrow, StatusBarStyle, ThemeType } from '../types';
import themeLight from '../styles/themeLight';
import themeDark from '../styles/themeDark';

export default (backgroundColor: string, narrow: Narrow, theme: ThemeType): StatusBarStyle =>
  narrow && isStreamOrTopicNarrow(narrow)
    ? backgroundColor
    : theme === 'default' ? themeLight.backgroundColor : themeDark.backgroundColor;
