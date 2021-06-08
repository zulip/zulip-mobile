import { shortTime, shortDate, longDate, daysInDate, humanDate } from '../date';

describe('Timezones (for test environment only)', () => {
  test('Timezone has been set to UTC, unless on Windows', () => {
    expect(
      new Date().getTimezoneOffset() === 0
        // 'win32' is the only possible value that would indicate Windows:
        // https://chat.zulip.org/#narrow/stream/243-mobile-team/topic/Snapshot.20tests/near/1167560
        || process.platform === 'win32',
    ).toBe(true);
  });
});

describe('shortTime', () => {
  test('returns only hour and minutes', () => {
    const date = new Date(Date.UTC(2000, 0, 1, 20, 10));
    expect(shortTime(date)).toBe('8:10 PM');
  });

  test('returns as 24hrs time format, when true passed as second parameter', () => {
    const date = new Date(Date.UTC(2000, 0, 1, 20, 10));
    expect(shortTime(date, true)).toBe('20:10');
  });
});

describe('shortDate', () => {
  test('returns month and day, no year', () => {
    const date = new Date(2000, 0, 1, 20, 10);
    expect(shortDate(date)).toBe('Jan 1');
  });
});

describe('longDate', () => {
  test('returns month, day and year', () => {
    const date = new Date(2000, 0, 1, 20, 10);
    expect(longDate(date)).toBe('Jan 1, 2000');
  });
});

describe('daysInDate', () => {
  test('determines the days in a Date', () => {
    expect(daysInDate(Date.UTC(1970, 0, 1, 2, 0))).toBe(0);
    expect(daysInDate(Date.UTC(2000, 0, 1))).toBe(10957);
  });

  test('consecutive days differ one day', () => {
    const date1 = new Date(2000, 0, 1);
    const date2 = new Date(2000, 0, 2);

    const diff = daysInDate(date2) - daysInDate(date1);

    expect(diff).toBe(1);
  });
});

describe('humanDate', () => {
  test('if date is today, return "Today"', () => {
    expect(humanDate(new Date())).toBe('Today');
  });

  test('if date is yesterday, return "Yesterday"', () => {
    const date = new Date();
    date.setDate(date.getDate() - 1);
    expect(humanDate(date)).toBe('Yesterday');
  });

  test('if date is any other day than today and yesterday, return formatted date', () => {
    expect(humanDate(new Date(2000, 0, 1))).toBe('Jan 1, 2000');
  });
});
