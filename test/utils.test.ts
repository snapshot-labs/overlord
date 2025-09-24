import { toInteger } from '../src/helpers/utils';

describe('toInteger', () => {
  it('should return number when given a number', () => {
    expect(toInteger(42)).toBe(42);
    expect(toInteger(0)).toBe(0);
    expect(toInteger(-10)).toBe(-10);
  });

  it('should convert valid string to integer', () => {
    expect(toInteger('42')).toBe(42);
    expect(toInteger('0')).toBe(0);
    expect(toInteger('123456789')).toBe(123456789);
  });

  it('should throw error for invalid string', () => {
    expect(() => toInteger('abc')).toThrow('Invalid number: abc');
    expect(() => toInteger('12.34')).toThrow('Invalid number: 12.34');
    expect(() => toInteger('12a')).toThrow('Invalid number: 12a');
    expect(() => toInteger('a12')).toThrow('Invalid number: a12');
    expect(() => toInteger('')).toThrow('Invalid number: ');
    expect(() => toInteger(' 12 ')).toThrow('Invalid number:  12 ');
    expect(() => toInteger('-5')).toThrow('Invalid number: -5');
  });

  it('should handle edge cases', () => {
    expect(toInteger('000042')).toBe(42);
    expect(toInteger('9007199254740991')).toBe(9007199254740991); // MAX_SAFE_INTEGER
  });
});
