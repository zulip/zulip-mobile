import deepFreeze from 'deep-freeze';

import { HOME_NARROW } from '../../utils/narrow';
import getHtmlPieceDescriptors from '../getHtmlPieceDescriptors';

describe('getHtmlPieceDescriptors', () => {
  const narrow = deepFreeze([]);

  test('empty messages results in empty messageList', () => {
    const messageList = getHtmlPieceDescriptors([], HOME_NARROW);
    expect(messageList).toEqual([]);
  });

  test('renders time, header and message, in that order, for a single input', () => {
    const messages = deepFreeze([
      {
        timestamp: 123,
        avatar_url: '',
        id: 12345,
      },
    ]);

    const messageList = getHtmlPieceDescriptors(messages, narrow);

    expect(messageList).toMatchObject([
      { type: 'time', key: 'time123' },
      { type: 'header' },
      { type: 'message', key: 12345 },
    ]);
  });

  test('several messages in same stream, from same person result in time row, header for the stream, three messages, only first of which is full detail', () => {
    const messages = deepFreeze([
      {
        timestamp: 123,
        type: 'stream',
        id: 1,
        sender_full_name: 'John Doe',
        display_recipient: 'general',
        subject: '',
        avatar_url: '',
      },
      {
        timestamp: 124,
        type: 'stream',
        id: 2,
        sender_full_name: 'John Doe',
        display_recipient: 'general',
        subject: '',
        avatar_url: '',
      },
      {
        timestamp: 125,
        type: 'stream',
        id: 3,
        sender_full_name: 'John Doe',
        display_recipient: 'general',
        subject: '',
        avatar_url: '',
      },
    ]);

    const messageList = getHtmlPieceDescriptors(messages, narrow);

    expect(messageList).toMatchObject([
      { type: 'time' },
      { type: 'header' },
      { type: 'message', isBrief: false },
      { type: 'message', isBrief: true },
      { type: 'message', isBrief: true },
    ]);
  });

  test('several messages in same stream, from different people result in time row, header for the stream, three messages, only all full detail', () => {
    const messages = deepFreeze([
      {
        timestamp: 123,
        type: 'stream',
        id: 1,
        sender_full_name: 'John',
        display_recipient: 'general',
        subject: '',
        avatar_url: '',
      },
      {
        timestamp: 124,
        type: 'stream',
        id: 2,
        sender_full_name: 'Mark',
        display_recipient: 'general',
        subject: '',
        avatar_url: '',
      },
      {
        timestamp: 125,
        type: 'stream',
        id: 3,
        sender_full_name: 'Peter',
        display_recipient: 'general',
        subject: '',
        avatar_url: '',
      },
    ]);

    const messageList = getHtmlPieceDescriptors(messages, narrow);

    expect(messageList).toMatchObject([
      { type: 'time' },
      { type: 'header' },
      { type: 'message', key: 1, isBrief: false },
      { type: 'message', key: 2, isBrief: false },
      { type: 'message', key: 3, isBrief: false },
    ]);
  });

  test('private messages between two people, results in time row, header and two full messages', () => {
    const messages = deepFreeze([
      {
        timestamp: 123,
        type: 'private',
        id: 1,
        sender_full_name: 'John',
        avatar_url: '',
        display_recipient: [{ email: 'john@example.com' }, { email: 'mark@example.com' }],
      },
      {
        timestamp: 123,
        type: 'private',
        id: 2,
        sender_full_name: 'Mark',
        avatar_url: '',
        display_recipient: [{ email: 'john@example.com' }, { email: 'mark@example.com' }],
      },
    ]);

    const messageList = getHtmlPieceDescriptors(messages, narrow);

    expect(messageList).toMatchObject([
      { type: 'time' },
      { type: 'header' },
      { type: 'message', key: 1 },
      { type: 'message', key: 2 },
    ]);
  });
});
