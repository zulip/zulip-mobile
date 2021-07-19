/* @flow strict-local */
import type { MuteState } from '../types';

export const isTopicMuted = (stream: string, topic: string, mute: MuteState = []): boolean =>
  mute.some(x => x[0] === stream && x[1] === topic);
