import {
  shortTime,
  shortDate,
  longDate,
  daysInDate,
  isSameDay,
  isSameYear,
  humanDate,
} from '../date';

describe('shortTime', () => {
  test('returns only hour and minutes', () => {
    const date = new Date(2000, 0, 1, 20, 10);
    expect(shortTime(date)).toBe('8:10 PM');
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
    expect(daysInDate(new Date(1970, 0, 1, 2, 0))).toBe(0);
    expect(daysInDate(new Date(2000, 0, 1))).toBe(10956);
  });

  test('consecutive days differ one day', () => {
    const date1 = new Date(2000, 0, 1);
    const date2 = new Date(2000, 0, 2);

    const diff = daysInDate(date2) - daysInDate(date1);

    expect(diff).toBe(1);
  });
});

describe('isSameDay', () => {
  test('same dates are on the same day', () => {
    const date1 = new Date(2000, 0, 1);
    const date2 = new Date(2000, 0, 1);
    expect(isSameDay(date1, date2)).toBe(true);
  });

  test('dates with different days are not on the same day', () => {
    const date1 = new Date(2000, 1, 5);
    const date2 = new Date(2000, 0, 1);
    expect(isSameDay(date1, date2)).toBe(false);
  });
});

describe('isSameYear', () => {
  test('same dates are on the same year', () => {
    const date1 = new Date(2000, 0, 1);
    const date2 = new Date(2000, 0, 1);
    expect(isSameYear(date1, date2)).toBe(true);
  });

  test('different dates in same year return "true"', () => {
    const date1 = new Date(2000, 0, 1);
    const date2 = new Date(2000, 10, 10);
    expect(isSameYear(date1, date2)).toBe(true);
  });

  test('different years return "false"', () => {
    const date1 = new Date(1995, 1, 1);
    const date2 = new Date(2000, 0, 1);
    expect(isSameYear(date1, date2)).toBe(false);
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
