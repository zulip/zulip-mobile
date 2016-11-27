import { isSameDay } from '../date';

describe('isSameDay', () => {
  test('same dates are on the same day', () => {
    const date1 = new Date(2000, 1, 1);
    const date2 = new Date(2000, 1, 1);
    expect(isSameDay(date1, date2)).toBe(true);
  });

  test('dates with different days are not on the same day', () => {
    const date1 = new Date(2000, 1, 5);
    const date2 = new Date(2000, 1, 1);
    expect(isSameDay(date1, date2)).toBe(false);
  });
});
